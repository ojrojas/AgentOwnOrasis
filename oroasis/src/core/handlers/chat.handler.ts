import * as vscode from 'vscode';
import { ChatController } from '../controllers/chat.controller';
import { IOllamaApiService } from '../interfaces/provider.interface.service';
import { IWorkspaceStateRepository } from '../interfaces/workspace-repository-state.interface.service';
import { IChatMessage } from '../types/chat-message.type';
import { v4 as uuidv4 } from 'uuid';
import { AbortableAsyncIterator, ChatResponse, GenerateResponse } from 'ollama';
import { handleError } from '../../shared/generics/errors';
import { isChatResponse, isGenerateResponse, sendToWebview } from '../../shared/utils/chat.utils';

export function createChatHandlers(
    panel: vscode.WebviewPanel,
    ollamaService: IOllamaApiService,
    chatRepository: IWorkspaceStateRepository<IChatMessage>,
    outputChannel: vscode.OutputChannel
) {
    const chatController = new ChatController(ollamaService);
    const settings = vscode.workspace.getConfiguration('oroasisSettings');

    const preferredModel = settings.get('modelDefault');
    const temperature = parseFloat(settings.get('modelTemperature') as string) || 0.1;
    const promptDefault = settings.get('templatePromptGenerate') as string;

    return {
        "emitStatusAppChat:request": async (requestId: string) => {
            sendToWebview(panel, "emitStatusAppChat:response", requestId, { id: '200OK', name: 'OrasisApp' });
        },

        "getModels:request": async (requestId: string) => {
            try {
                const models = await chatController.listModels();
                sendToWebview(panel, "getModels:response", requestId, models);
            } catch (error) {
                handleError(error, outputChannel, "No IA models were obtained or ollama service was not available");
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
            let chat = chatRepository.findById(payload.chatId) ?? {
                id: payload.chatId,
                messages: payload.messages,
                context: payload.context
            };

            chat.messages.push({
                id: payload.id,
                content: payload.content,
                model: payload.model,
                role: payload.role,
                timestamp: payload.timestamp,
                context: payload.context
            });

            await chatRepository.updateById(payload.chatId, chat);

            try {
                let response: AbortableAsyncIterator<ChatResponse | GenerateResponse>;
                if (payload.type === 'chat') {
                    response = await chatController.chat({
                        model: payload.model,
                        messages: chat.messages,
                        options: { temperature }
                    });
                } else {
                    response = await chatController.generate({
                        model: payload.model,
                        prompt: payload.content,
                        system: promptDefault,
                        context: payload.context,
                        options: { temperature: 0.3 }
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

                    sendToWebview(panel, "sendChat:response", requestId, {
                        content: accumulated,
                        role: "assistant",
                        done: chunk.done,
                        id: uuidv4(),
                        context: contextAccumulated || undefined
                    });
                }

                chat.messages.push({
                    content: accumulated,
                    id: uuidv4(),
                    role: "assistant",
                    model: payload.model,
                    timestamp: new Date()
                });

                await chatRepository.updateById(payload.chatId, chat);
                sendToWebview(panel, "sendChat:response:done");

            } catch (error) {
                handleError(error, outputChannel, "Error: request ollama service");
                sendToWebview(panel, "sendChat:response:done");
            }
        }
    };
}
