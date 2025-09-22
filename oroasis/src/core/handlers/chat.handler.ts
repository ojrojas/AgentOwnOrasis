import * as vscode from 'vscode';
import { IChatMessage, IGenerateRequest, IChatRequest } from '../types/chat-message.type';
import { v4 as uuidv4 } from 'uuid';
import { handleError } from '../../shared/generics/errors';
import { sendToWebview } from '../../shared/utils/chat.utils';
import { IProviderFactory } from '../services/provider.factory.service';
import { asAsyncGenerator } from '../../shared/generics/asasyncgenerator';
import { IWorkspaceStateRepository } from '../interfaces/workspace-repository-state.interface.service';

export function createChatHandlers(
    panel: vscode.WebviewPanel,
    providersFactory: IProviderFactory,
    defaultProvider: string,
    chatRepository: IWorkspaceStateRepository<IChatMessage>,
    outputChannel: vscode.OutputChannel
) {
    const settings = vscode.workspace.getConfiguration('oroasisSettings');
    const temperature = parseFloat(settings.get<string>('modelTemperature') ?? '0.1');
    const promptDefault = settings.get<string>('templatePromptGenerate');
    const rolAgent = settings.get<string>('roleAgentDefault');

    return {
        "emitStatusAppChat:request": async (requestId: string) => {
            sendToWebview(panel, "emitStatusAppChat:response", requestId, { id: '200OK', name: 'OrasisApp' });
        },

        "getModels:request": async (requestId: string, providerName?: string) => {
            try {
                const adapter = providersFactory.getAdapter(providerName || defaultProvider);
                const models = await adapter.listModels();
                sendToWebview(panel, "getModels:response", requestId, models);
            } catch (error) {
                handleError(error, outputChannel, "No IA models were obtained or provider service was not available");
                sendToWebview(panel, "getModels:response", requestId, { models: [] });
            }
        },

        // "getPreferredModel:request": async (requestId: string) => {
        //     sendToWebview(panel, "getPreferredModel:response", requestId, preferredModel);
        // },

        "getAllMessages:request": async (requestId: string) => {
            const chats = chatRepository.findAllSync();
            sendToWebview(panel, "getAllMessages:response", requestId, chats);
        },

        "getInfoModel:request": async (requestId: string, payload: any) => {
            const adapter = providersFactory.getAdapter(payload.provider || defaultProvider);
            const infoModel = await adapter.show?.(payload.model);
            sendToWebview(panel, "getInfoModel:response", requestId, infoModel);
        },

        "sendChat:request": async (requestId: string, payload: any) => {
            if (!payload || !payload.model || !payload.content) {
                outputChannel.appendLine("sendChat:request aborted: payload incomplete");
                return;
            }

            let chat = chatRepository.findById(payload.chatId);
            try {

                if (chat === undefined) {
                    chat = {
                        id: payload.chatId,
                        messages: [{
                            content: payload.content,
                            id: uuidv4(),
                            model: payload.model,
                            role: payload.role,
                            timestamp: new Date(),
                            chatId: payload.chatId,
                            done: true,
                        }],
                        context: payload.context ?? [],
                        done: true
                    };
                    await chatRepository.insert(chat);
                } else {
                    chat.messages.push({
                        id: uuidv4(),
                        content: payload.content,
                        model: payload.model,
                        role: payload.role,
                        timestamp: payload.timestamp,
                        context: payload.context,
                        done: true,
                        chatId: payload.id
                    });
                    await chatRepository.updateById(payload.chatId, chat);
                }
            } catch (repoError) {
                outputChannel.appendLine(`Warning: Failed to update chat repository at start: ${repoError}`);
            }

            try {
                const messageId = uuidv4();
                const adapter = providersFactory.getAdapter(payload.provider || defaultProvider);
                let accumulated = '';
                let contextAccumulated: number[] | undefined;

                if (payload.type === 'chat') {
                    let chatStream = adapter.chatStream?.({
                        model: payload.model,
                        messages: payload.messages,
                        options: { temperature },
                    } as IChatRequest);

                    if (chatStream) {
                        chatStream = asAsyncGenerator(chatStream);
                        for await (const chunk of chatStream) {
                            try {
                                accumulated += chunk.content ?? '';
                                contextAccumulated = chunk.context;
                                try {
                                    sendToWebview(panel, "sendChat:response", requestId, {
                                        content: accumulated,
                                        role: "assistant",
                                        done: chunk.done,
                                        id: messageId,
                                        context: contextAccumulated,
                                        timestamp: new Date(),
                                        model: payload.model
                                    });
                                } catch (webviewError) {
                                    outputChannel.appendLine(`Webview send error: ${webviewError}`);
                                }
                            } catch (chunkError) {
                                outputChannel.appendLine(`Chunk processing error: ${chunkError}`);
                            }
                        }
                    }
                } else {
                    let generateStream = adapter.generateStream?.({
                        model: payload.model,
                        prompt: payload.content,
                        system: promptDefault,
                        context: payload.context,
                        options: { temperature: 0.3 },
                    } as IGenerateRequest);

                    if (generateStream) {
                        generateStream = asAsyncGenerator(generateStream);
                        try {
                            for await (const chunk of generateStream) {
                                accumulated += chunk.content ?? '';
                                contextAccumulated = chunk.context;
                                try {
                                    sendToWebview(panel, "sendChat:response", requestId, {
                                        content: accumulated,
                                        role: "assistant",
                                        done: chunk.done,
                                        id: messageId,
                                        context: contextAccumulated,
                                        timestamp: new Date(),
                                        model: payload.model,
                                    });
                                } catch (webviewError) {
                                    outputChannel.appendLine(`Webview send error: ${webviewError}`);
                                }
                            }
                        } catch (chunkError) {
                            outputChannel.appendLine(`Chunk processing error: ${chunkError}`);
                        }
                    }
                }

                chat!.messages.push({
                    content: accumulated,
                    role: "assistant",
                    done: true,
                    id: messageId,
                    context: contextAccumulated,
                    timestamp: new Date(),
                    model: payload.model
                });

                try {
                    await chatRepository.updateById(payload.chatId, chat!);
                } catch (repoError) {
                    outputChannel.appendLine(`Warning: Failed to update chat repository at end: ${repoError}`);
                }

                try {
                    sendToWebview(panel, "sendChat:response:done", requestId, {
                        content: accumulated,
                        role: "assistant",
                        done: true,
                        id: messageId,
                        context: contextAccumulated,
                        timestamp: new Date()
                    });
                } catch (webviewError) {
                    outputChannel.appendLine(`Webview final done error: ${webviewError}`);
                }

            } catch (error) {
                handleError(error, outputChannel, "Error: request provider service");
                try {
                    sendToWebview(panel, "sendChat:response:done");
                } catch (webviewError) {
                    outputChannel.appendLine(`Webview done error after catch: ${webviewError}`);
                }
            }
        }
    };
}
