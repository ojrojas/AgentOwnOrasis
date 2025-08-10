import * as vscode from 'vscode';
import { ChatController } from '../controllers/chat.controller';
import { IOllamaApiService } from '../interfaces/ollama.interface.service';
import { IWorkspaceStateRepository } from '../interfaces/workspace-repository-state.interface.service';
import { IChatMessage } from '../types/chat-message.type';
import { v4 as uuidv4 } from 'uuid';
import { OutputChannel } from 'vscode';

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
                await chatRepository.insert(payload);
                const messages = chatRepository.findAllSync().map(item => ({
                    content: item.content,
                    role: item.role
                }));

                try {
                    const response = await chatController.chat({
                        model: payload.model,
                        messages: messages
                    });

                    let accumulated = '';
                    for await (const chunk of response) {
                        // const token = chunk.message.content || '';
                        accumulated += chunk.message.content || '';

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
