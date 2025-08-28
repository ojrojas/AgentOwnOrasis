import * as vscode from 'vscode';
import { IOllamaApiService } from '../interfaces/ollama.interface.service';
import { IWorkspaceStateRepository } from '../interfaces/workspace-repository-state.interface.service';
import { IChatMessage } from '../types/chat-message.type';
import { createChatHandlers } from '../handlers/chat.handlers';

export function registerChatCommands(
    context: vscode.ExtensionContext,
    panel: vscode.WebviewPanel,
    ollamaService: IOllamaApiService,
    chatRepository: IWorkspaceStateRepository<IChatMessage>,
    outputChannel: vscode.OutputChannel
) {
    const handlers = createChatHandlers(panel, ollamaService, chatRepository, outputChannel);

    panel.webview.onDidReceiveMessage(async ({ type, requestId, payload }) => {
        const handler = handlers[type as keyof typeof handlers];
        if (handler) {
            await handler(requestId, payload);
        }
    });
}
