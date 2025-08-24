import * as vscode from 'vscode';
import { ChatController } from '../controllers/chat.controller';
import { IOllamaApiService } from '../interfaces/ollama.interface.service';
import { IWorkspaceStateRepository } from '../interfaces/workspace-repository-state.interface.service';
import { IChatMessage } from '../types/chat-message.type';
import { v4 as uuidv4 } from 'uuid';
import { OutputChannel } from 'vscode';
import { AbortableAsyncIterator, ChatResponse, GenerateResponse, Message } from 'ollama';

const buildPromptFromMessages = (messages: Message[]) => {
    return messages
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join("\n");
};


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

            case 'sendChat:request':
                debugger;
                await chatRepository.insert(payload);
                const messages = chatRepository.findAllSync().map(item => ({
                    content: item.content,
                    role: item.role
                }));

                try {
                    const temp = parseFloat(temperature);
                    let response: AbortableAsyncIterator<ChatResponse | GenerateResponse>;
                    if (payload.type === 'chat') {
                        response = await chatController.chat({
                            model: payload.model,
                            messages: messages,
                            options: {
                                temperature: temp  ?? 0.1,
                            }
                        });

                    } else {
                        response = await chatController.generate({
                            model: payload.model,
                            prompt: buildPromptFromMessages(messages),
                            context: payload.context,
                            system: promptDefault as string,
                            options: {
                                temperature: temp  ?? 0.1,
                            }
                        });
                    }

                    let accumulated = '';
                    for await (const chunk of response) {
                        if (isChatResponse(chunk)) {
                            accumulated += chunk.message.content || '';
                        } else if (isGenerateResponse(chunk)) {
                            accumulated += chunk.response;
                        }

                        panel.webview.postMessage({
                            type: 'sendChat:response',
                            requestId,
                            payload: {
                                content: accumulated,
                                role: 'assistant',
                                done: chunk.done,
                                id: uuidv4()
                            },
                        });
                    }

                    await chatRepository.insert({
                        content: accumulated,
                        id: uuidv4(),
                        role: 'assistant'
                    });

                    panel.webview.postMessage({
                        type: 'sendChat:response:done'
                    });
                } catch (error) {
                    outputChannel.appendLine("Error: request ollama service");
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
