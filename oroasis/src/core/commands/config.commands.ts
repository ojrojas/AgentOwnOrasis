import * as vscode from 'vscode';
import { IWorkspaceStateRepository } from '../interfaces/workspace-repository-state.interface.service';
import { IProviderConfig } from '../types/provider.type';
import { createConfigandlers } from '../handlers/config.handler';

export function registerConfigCommands(
    context: vscode.ExtensionContext,
    panel: vscode.WebviewPanel,
    providerRepository: IWorkspaceStateRepository<IProviderConfig>,
    outputChannel: vscode.OutputChannel) {

    const handlers = createConfigandlers(panel, providerRepository, outputChannel);

    panel.webview.onDidReceiveMessage(async ({ type, requestId, payload }) => {

        const handler = handlers[type as keyof typeof handlers];
        if (handler) {
            await handler(requestId, payload);
        }
    });
}
