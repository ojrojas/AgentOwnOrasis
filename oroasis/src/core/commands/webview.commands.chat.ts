import * as vscode from 'vscode';
import { IWorkspaceStateRepository } from '../interfaces/workspace-repository-state.interface.service';
import { IChatMessage } from '../types/chat-message.type';
import { createChatHandlers } from '../handlers/chat.handler';
import { IProviderFactory } from '../services/provider.factory.service';

export function registerChatCommands(
    context: vscode.ExtensionContext,
    panel: vscode.WebviewPanel,
    providersFactory: IProviderFactory,
    defaultProvider: string,
    chatRepository: IWorkspaceStateRepository<IChatMessage>,
    outputChannel: vscode.OutputChannel
) {
    const handlers = createChatHandlers(panel, providersFactory, defaultProvider, chatRepository, outputChannel);

    panel.webview.onDidReceiveMessage(async ({ type, requestId, payload }) => {
        const handler = handlers[type as keyof typeof handlers];
        if (handler) {
            await handler(requestId, payload);
        }
    });
}
