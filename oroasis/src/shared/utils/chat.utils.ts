import * as vscode from 'vscode';
import { IChatMessage, IChatRequest, IGenerateMessage, IGenerateRequest, IMessage } from '../../core/types/chat-message.type';
import { PromptsChats } from '../../assets/prompts-chat.collection';
import { v4 as uuidv4 } from 'uuid';
import { asAsyncGenerator } from '../generics/asasyncgenerator';
import { StringBuilder } from './stringbuilder.utils';
import { IProviderApiService } from '../../core/interfaces/provider.interface.service';
import { IWorkspaceStateRepository } from '../../core/interfaces/workspace-repository-state.interface.service';


export function sendToWebview(
    panel: vscode.WebviewPanel,
    type: string,
    requestId?: string,
    payload?: any
) {
    panel.webview.postMessage({ type, requestId, payload });
}

export function isChatResponse(obj: any): obj is IChatMessage {
    return obj && typeof obj === "object" && "message" in obj;
}

export function isGenerateResponse(obj: any): obj is IGenerateMessage {
    return obj && typeof obj === "object" && "response" in obj;
}

export function isValidPayload(payload: any): boolean {
    return !!(payload && payload.model && payload.content);
}

export function getSystemPrompt(typeMessage: string): IMessage | undefined {
    if (typeMessage === 'chat') {
        return {
            role: 'system',
            content: PromptsChats

        } as IMessage;
    }
    return undefined;
}

export async function ensureChatExists(payload: any, repo: any, logger: any) {
    let chat = repo.findById(payload.chatId);
    try {
        if (!chat) {
            chat = {
                id: payload.chatId,
                messages: [buildUserMessage(payload)],
                context: payload.context ?? [],
                done: true
            };
            await repo.insert(chat);
        } else {
            chat.messages.push(buildUserMessage(payload));
            await repo.updateById(payload.chatId, chat);
        }
    } catch (err) {
        logger.appendLine(`Warning: Failed to update chat repository at start: ${err}`);
    }
    return chat;
}

export function buildUserMessage(payload: any) {
    return {
        id: uuidv4(),
        content: payload.content,
        model: payload.model,
        role: payload.role,
        timestamp: payload.timestamp ?? new Date(),
        context: payload.context,
        done: true,
        chatId: payload.chatId
    };
}

export function buildAssistantMessage(content: string, id: string, model: string, context?: number[]) {
    return {
        id,
        content,
        model,
        role: "assistant",
        done: true,
        context,
        timestamp: new Date()
    };
}

export async function handleChatStream(
    adapter: IProviderApiService,
    payload: any,
    requestId: string,
    panel: vscode.WebviewPanel,
    messageId: string,
    logger: vscode.OutputChannel,
    temperature?: number) {
    let accumulated = '';


    let chatStream = adapter.chatStream?.({
        model: payload.model,
        think: payload.think ?? null,
        messages: payload.messages,
        options: { temperature }
    } as IChatRequest);

    if (!chatStream) {
        return accumulated;
    }

    for await (const chunk of asAsyncGenerator(chatStream)) {
        accumulated += chunk.content ?? '';
        sendSafe(panel, "sendChat:response", logger, requestId, buildAssistantMessage(accumulated, messageId, payload.model, chunk.context));
    }
    return accumulated;
}

export async function handleGenerateStream(
    adapter: IProviderApiService,
    payload: any,
    requestId: string,
    panel: vscode.WebviewPanel,
    systemPrompt: string,
    messageId: string,
    logger: vscode.OutputChannel) {
    let accumulated = '';
    let generateStream = adapter.generateStream?.({
        model: payload.model,
        prompt: payload.content,
        system: systemPrompt,
        think: payload.think ?? null,
        context: payload.context,
        options: { temperature: 0.3 },
    } as IGenerateRequest);

    if (!generateStream) {
        return accumulated;
    }

    for await (const chunk of asAsyncGenerator(generateStream)) {
        accumulated += chunk.content ?? '';
        sendSafe(panel, "sendChat:response", logger, requestId, buildAssistantMessage(accumulated, messageId, payload.model, chunk.context));
    }
    return accumulated;
}

export async function handleFileEdit(accumulated: string, workspaceController: any) {
    try {
        const parsed = JSON.parse(accumulated);
        if (parsed.action === "editFiles") {
            const confirm = await vscode.window.showWarningMessage(
                `The model wants to edit ${parsed.changes.length} file(s). Do you want to continue?`,
                "Yes", "No"
            );
            if (confirm === "Yes") {
                for (let change of parsed.changes) {
                    await workspaceController.previewAndSave(change.path, change.newContent);
                }
            } else {
                vscode.window.showInformationMessage("Changes discarded.");
            }
        }
    } catch {
        // ignore invalid JSON
    }
}

export async function safeUpdateChat(repo: IWorkspaceStateRepository<IChatMessage>, chatId: string, chat: IChatMessage, logger: vscode.OutputChannel) {
    try {
        await repo.updateById(chatId, chat);
    } catch (err) {
        logger.appendLine(`Warning: Failed to update chat repository at end: ${err}`);
    }
}

export function sendSafe(panel: vscode.WebviewPanel, channel: string, logger: vscode.OutputChannel, requestId?: string, payload?: any) {
    try {
        sendToWebview(panel, channel, requestId, payload);
    } catch (err) {
        logger.appendLine(`Webview send error [${channel}]: ${err}`);
    }
}
