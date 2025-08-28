import * as vscode from 'vscode';
import { ChatController } from '../controllers/chat.controller';
import { IOllamaApiService } from '../interfaces/ollama.interface.service';
import { IWorkspaceStateRepository } from '../interfaces/workspace-repository-state.interface.service';
import { IChatMessage } from '../types/chat-message.type';
import { v4 as uuidv4 } from 'uuid';
import { OutputChannel } from 'vscode';
import { AbortableAsyncIterator, ChatResponse, GenerateResponse, Message } from 'ollama';

function isChatResponse(obj: any): obj is ChatResponse {
    return obj && typeof obj === "object" && "message" in obj;
}

function isGenerateResponse(obj: any): obj is GenerateResponse {
    return obj && typeof obj === "object" && "response" in obj;
}

export function registerChatCommands(
    context: vscode.ExtensionContext,
    panel: vscode.WebviewPanel,
    ollamaService: IOllamaApiService,
    chatRepository: IWorkspaceStateRepository<IChatMessage>,
    outputChannel: OutputChannel
) {
    const chatController = new ChatController(ollamaService);
    const settings = vscode.workspace.getConfiguration('oroasisSettings');
    const preferredModel = settings.get('modelDefault');
    const temperature = settings.get('modelTemperature') as string;
    const promptDefault = settings.get('templatePromptGenerate');

    panel.webview.onDidReceiveMessage(async (message) => {
        const { type, requestId, payload } = message;
        switch (type) {
            case 'emitStatusAppChat:request':
                const appData = { id: '200OK', name: 'OrasisApp' };
                panel.webview.postMessage({
                    type: 'emitStatusAppChat:response',
                    requestId,
                    payload: appData,
                });
                break;

            case 'getModels:request':
                try {
                    const models = await chatController.listModels();

                    panel.webview.postMessage({
                        type: 'getModels:response',
                        requestId,
                        payload: models,
                    });
                } catch (error) {
                    outputChannel.appendLine("No IA models were obtained or ollama service was not available.");
                    panel.webview.postMessage({
                        type: 'getModels:response',
                        requestId,
                        payload: { models: [] },
                    });
                }
                break;

            case 'getPreferredModel:request':
                panel.webview.postMessage({
                    type: 'getPreferredModel:response',
                    requestId,
                    payload: preferredModel,
                });
                break;

            case 'getAllMessages:request':
                panel.webview.postMessage({
                    type: 'getAllMessages:response',
                    requestId,
                    payload: chatRepository.findAllSync(),
                });
                break;

            case 'sendChat:request':
                const exists = chatRepository.findById(payload.chatId);
                const chatIncomming = {
                    id: payload.chatId,
                    messages: payload.messages,
                    context: payload.context
                };
                if (exists === undefined) {
                    await chatRepository.insert(chatIncomming);
                }
                else {
                    exists.messages.push({ 
                        content: payload.content,
                        id: payload.id,
                        model: payload.model,
                        role: payload.role,
                        timestamp: payload.timestamp,
                        context: payload.context
                    } );
                    await chatRepository.updateById(payload.chatId, exists);
                }

                try {
                    const temp = parseFloat(temperature);
                    let response: AbortableAsyncIterator<ChatResponse | GenerateResponse>;
                    if (payload.type === 'chat') {
                        response = await chatController.chat({
                            model: payload.model,
                            messages: exists?.messages ?? chatIncomming.messages,
                            options: {
                                temperature: temp ?? 0.1,
                            }
                        });

                    } else {
                        response = await chatController.generate({
                            model: payload.model,
                            prompt: payload.content,
                            system: promptDefault as string,
                            context: payload.context,
                            options: {
                                temperature: temp ?? 0.3,
                            }
                        });
                    }

                    let accumulated = '';
                    let contextAccumulated: number[] = [];
                    for await (const chunk of response) {
                        if (isChatResponse(chunk)) {
                            accumulated += chunk.message.content || '';
                        } else if (isGenerateResponse(chunk)) {
                            accumulated += chunk.response;
                            contextAccumulated = chunk.context;
                        }

                        panel.webview.postMessage({
                            type: 'sendChat:response',
                            requestId,
                            payload: {
                                content: accumulated,
                                role: 'assistant',
                                done: chunk.done,
                                id: uuidv4(),
                                context: contextAccumulated || undefined
                            },
                        });
                    }

                    exists?.messages.push({
                        content: accumulated,
                        id: uuidv4(),
                        role: 'assistant',
                        model: payload.model,
                        timestamp: new Date()
                    });

                    chatIncomming.messages.push({
                        content: accumulated,
                        id: uuidv4(),
                        role: 'assistant',
                        model: payload.model,
                        timestamp: new Date()
                    });

                    await chatRepository.updateById(payload.chatId, exists ?? chatIncomming);

                    panel.webview.postMessage({
                        type: 'sendChat:response:done'
                    });
                } catch (error) {
                    outputChannel.appendLine(`Error: request ollama service ${error}`,);
                    panel.webview.postMessage({
                        type: 'sendChat:response:done'
                    });
                }
                break;

            default:
                break;
        }
    });
}
