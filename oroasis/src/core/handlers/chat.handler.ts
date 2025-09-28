import * as vscode from 'vscode';
import { IChatMessage } from '../types/chat-message.type';
import { v4 as uuidv4 } from 'uuid';
import { handleError } from '../../shared/generics/errors';
import {
    buildAssistantMessage,
    ensureChatExists,
    getSystemPrompt,
    handleChatStream,
    handleFileEdit,
    handleGenerateStream,
    isValidPayload,
    safeUpdateChat,
    sendSafe,
    sendToWebview
} from '../../shared/utils/chat.utils';
import { IProviderFactory } from '../services/provider.factory.service';
import { IWorkspaceStateRepository } from '../interfaces/workspace-repository-state.interface.service';
import { WorkspaceController } from '../controllers/workspace.controller';
import { IFileChange } from '../types/file-change.type';
import { WorkspaceFilesRepositoryService } from '../services/workspace-repository-files.service';
import { StringBuilder } from '../../shared/utils/stringbuilder.utils';
import { PromptsChats } from '../../assets/prompts-chat.collection';
import { basicPrompts } from '../../assets/basic-prompts.collection';

export function createChatHandlers(
    panel: vscode.WebviewPanel,
    providersFactory: IProviderFactory,
    defaultProvider: string,
    chatRepository: IWorkspaceStateRepository<IChatMessage>,
    outputChannel: vscode.OutputChannel
) {
    const workspaceService = new WorkspaceFilesRepositoryService();
    const workspaceController = new WorkspaceController(workspaceService);
    const settings = vscode.workspace.getConfiguration('oroasisSettings');
    const temperature = parseFloat(settings.get<string>('modelTemperature') ?? '0.1');
    const promptDefault = settings.get<string>('templatePromptGenerate') as string;
    const rolAgent = settings.get<string>('roleAgentDefault');

    async function findFilesContentAsync(files?: string[]): Promise<IFileChange[] | null> {
        if (!files || files.length === 0) {
            return null;
        }

        return Promise.all(
            files.map(async (file) => ({
                path: file,
                newContent: await workspaceController.readFile(file),
            }))
        );
    }

    async function enrichContentWithFiles(payload: any): Promise<string> {

        const existsFiles = await findFilesContentAsync();
        if (!existsFiles) {
            return payload.content;
        }

        const sb = new StringBuilder(payload.content);
        for (const file of existsFiles) {
            sb.appendLine(`${file.path}: ${file.newContent}`);
        }
        return sb.toValueString();
    }

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
            if (!isValidPayload(payload)) {
                outputChannel.appendLine("sendChat:request aborted: payload incomplete");
                return;
            }

            const systemPrompt = getSystemPrompt(payload.type);

            if (systemPrompt) {
                payload.messages = [systemPrompt, { role: payload.role, content: payload.content }];
            }

            let chat = await ensureChatExists(payload, chatRepository, outputChannel);

            payload.content = await enrichContentWithFiles(payload);
            payload.options = { temperature: temperature };

            const adapter = providersFactory.getAdapter(payload.provider || defaultProvider);
            const messageId = uuidv4();

            let accumulated = '';
            let contextAccumulated: number[] | undefined;

            try {
                if (payload.type === 'chat') {
                    accumulated = await handleChatStream(
                        adapter,
                        payload,
                        requestId,
                        panel,
                        messageId,
                        outputChannel
                    );
                } else {
                    accumulated = await handleGenerateStream(
                        adapter,
                        payload,
                        requestId,
                        panel,
                        basicPrompts,
                        messageId,
                        outputChannel
                    );
                }

                if (accumulated.includes('editFiles')) {
                    await handleFileEdit(accumulated, workspaceController);
                }

                chat.messages.push(buildAssistantMessage(accumulated, messageId, payload.model, contextAccumulated));
                await safeUpdateChat(chatRepository, payload.chatId, chat, outputChannel);

                sendSafe(panel, "sendChat:response:done", outputChannel, requestId, buildAssistantMessage(accumulated, messageId, payload.model, contextAccumulated));
            } catch (error) {
                handleError(error, outputChannel, "Error: request provider service");
                sendSafe(panel, "sendChat:response:done", outputChannel, requestId);
            }
        }
    };
}
