import * as vscode from 'vscode';
import { IWorkspaceStateRepository } from '../interfaces/workspace-repository-state.interface.service';
import { IChatMessage, IGenerateRequest, IChatRequest } from '../types/chat-message.type';
import { v4 as uuidv4 } from 'uuid';
import { handleError } from '../../shared/generics/errors';
import { sendToWebview } from '../../shared/utils/chat.utils';
import { IProviderFactory } from '../services/provider.factory.service';
import { asAsyncGenerator } from '../../shared/generics/asasyncgenerator';

export function createChatHandlers(
    panel: vscode.WebviewPanel,
    providersFactory: IProviderFactory,
    defaultProvider: string,
    chatRepository: IWorkspaceStateRepository<IChatMessage>,
    outputChannel: vscode.OutputChannel
) {

    const settings = vscode.workspace.getConfiguration('oroasisSettings');
    const preferredModel = settings.get('modelDefault');
    const temperature = parseFloat(settings.get('modelTemperature') as string) || 0.1;
    const promptDefault = settings.get('templatePromptGenerate') as string;

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

        "getPreferredModel:request": async (requestId: string) => {
            sendToWebview(panel, "getPreferredModel:response", requestId, preferredModel);
        },

        "getAllMessages:request": async (requestId: string) => {
            sendToWebview(panel, "getAllMessages:response", requestId, chatRepository.findAllSync());
        },

        "sendChat:request": async (requestId: string, payload: any) => {
            if (!payload || !payload.model || !payload.content) {
                outputChannel.appendLine("sendChat:request aborted: payload incomplete");
                return;
            }

            let chat = chatRepository.findById(payload.chatId) ?? {
                id: payload.chatId,
                messages: payload.messages ?? [],
                context: payload.context ?? []
            };

            chat.messages.push({
                id: payload.id,
                content: payload.content,
                model: payload.model,
                role: payload.role,
                timestamp: payload.timestamp,
                context: payload.context
            });

            try {
                await chatRepository.updateById(payload.chatId, chat);
            } catch (repoError) {
                outputChannel.appendLine(`Warning: Failed to update chat repository at start: ${repoError}`);
            }

            try {
                const adapter = providersFactory.getAdapter(payload.provider || defaultProvider);
                let accumulated = '';
                let contextAccumulated: number[] = [];

                if (payload.type === 'chat') {
                    let chatStream = adapter.chatStream?.({
                        model: payload.model,
                        messages: chat.messages,
                        options: { temperature },
                    } as IChatRequest);

                    if (chatStream) {
                        chatStream = asAsyncGenerator(chatStream);
                        for await (const chunk of chatStream) {
                            try {
                                accumulated += chunk.content ?? '';
                                contextAccumulated = chunk.context ?? contextAccumulated;
                                try {
                                    sendToWebview(panel, "sendChat:response", requestId, {
                                        content: accumulated,
                                        role: "assistant",
                                        done: chunk.done,
                                        id: uuidv4(),
                                        context: contextAccumulated
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
                                contextAccumulated = chunk.context ?? contextAccumulated;
                                try {
                                    sendToWebview(panel, "sendChat:response", requestId, {
                                        content: accumulated,
                                        role: "assistant",
                                        done: chunk.done,
                                        id: uuidv4(),
                                        context: contextAccumulated
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

                chat.messages.push({
                    content: accumulated,
                    id: uuidv4(),
                    role: "assistant",
                    model: payload.model,
                    timestamp: new Date(),
                    context: contextAccumulated,
                });

                try {
                    await chatRepository.updateById(payload.chatId, chat);
                } catch (repoError) {
                    outputChannel.appendLine(`Warning: Failed to update chat repository at end: ${repoError}`);
                }

                try {
                    sendToWebview(panel, "sendChat:response:done", requestId, {
                        content: accumulated,
                        role: "assistant",
                        done: true,
                        id: uuidv4(),
                        context: contextAccumulated
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
