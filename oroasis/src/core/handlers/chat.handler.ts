import { v4 as uuidv4 } from 'uuid';
import * as vscode from 'vscode';
import { handleError } from '../../shared/generics/errors';
import {
    buildAssistantMessage,
    ensureChatExists,
    getSystemPrompt,
    handleChatStream,
    isValidPayload,
    safeUpdateChat,
    sendSafe,
    sendToWebview
} from '../../shared/utils/chat.utils';
import { StringBuilder } from '../../shared/utils/stringbuilder.utils';
import { WorkspaceController } from '../controllers/workspace.controller';
import { IWorkspaceStateRepository } from '../interfaces/workspace-repository-state.interface.service';
import { IProviderFactory } from '../services/provider.factory.service';
import { ToolExecutorService } from '../services/tool-executor.service';
import { WorkspaceFilesRepositoryService } from '../services/workspace-repository-files.service';
import { IChatMessage } from '../types/chat-message.type';
import { IFileChange } from '../types/file-change.type';

// Import tools collection
import { ListTools } from '../../assets/tools.collection';

export function createChatHandlers(
    panel: vscode.WebviewPanel,
    providersFactory: IProviderFactory,
    defaultProvider: string,
    chatRepository: IWorkspaceStateRepository<IChatMessage>,
    outputChannel: vscode.OutputChannel
) {
    const workspaceService = new WorkspaceFilesRepositoryService();
    const workspaceController = new WorkspaceController(workspaceService);
    const toolExecutor = new ToolExecutorService(workspaceController, outputChannel);
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

        const existsFiles = await findFilesContentAsync(payload.files);
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
            let chat = await ensureChatExists(payload, chatRepository, outputChannel);

            if (systemPrompt) {
                // Include history + new message
                payload.messages = [
                    systemPrompt,
                    ...chat.messages.map((m: { role: any; content: any; }) => ({ role: m.role, content: m.content }))
                ];
            } else {
                payload.messages = chat.messages.map((m: { role: any; content: any; }) => ({ role: m.role, content: m.content }));
            }

            payload.content = await enrichContentWithFiles(payload);
            payload.options = { temperature: temperature };

            // Include tools in the payload
            payload.tool_calls = ListTools.map(tool => ({
                name: tool.function.name,
                parameters: tool.function.parameters
            }));

            const adapter = providersFactory.getAdapter(payload.provider || defaultProvider);
            const messageId = uuidv4();

            let accumulated = '';
            let contextAccumulated: number[] | undefined;

            if (payload.type !== 'Ask') {
                payload.think = true;
                outputChannel.appendLine(`Thinking mode activated: ${payload.think}`);
            }

            try {
                let loopCount = 0;
                const maxLoops = 5;
                let finalAccumulated = '';

                while (loopCount < maxLoops) {
                    accumulated = await handleChatStream(
                        adapter,
                        payload,
                        requestId,
                        panel,
                        messageId,
                        outputChannel
                    );
                    finalAccumulated += accumulated;

                    const toolCalls = toolExecutor.parseToolCalls(accumulated);
                    if (toolCalls.length === 0) {
                        break;
                    }

                    outputChannel.appendLine(`Detected ${toolCalls.length} tool calls. Executing...`);
                    
                    for (const toolCall of toolCalls) {
                        // Notify webview about tool execution
                        sendSafe(panel, "sendChat:response", outputChannel, requestId, {
                            id: uuidv4(),
                            role: 'assistant',
                            content: `\n\n> 🛠️ **Executing Tool:** \`${toolCall.tool}\`...\n`,
                            done: false
                        });

                        const result = await toolExecutor.execute(toolCall.tool, toolCall.parameters);
                        payload.messages.push({ role: 'assistant', content: accumulated });
                        payload.messages.push({ role: 'user', content: `Tool Result (${toolCall.tool}):\n${result}` });
                    }

                    loopCount++;
                    // Reset accumulated for next iteration
                    accumulated = '';
                }

                chat.messages.push(buildAssistantMessage(finalAccumulated, messageId, payload.model, contextAccumulated));
                await safeUpdateChat(chatRepository, payload.chatId, chat, outputChannel);

                sendSafe(panel, "sendChat:response:done", outputChannel, requestId, buildAssistantMessage(finalAccumulated, messageId, payload.model, contextAccumulated));
            } catch (error) {
                handleError(error, outputChannel, "Error: request provider service");
                sendSafe(panel, "sendChat:response:done", outputChannel, requestId);
            }
        }
    };
}
