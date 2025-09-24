import * as vscode from 'vscode';
import { createConfigandlers } from '../handlers/config.handler';
import { IGlobalStateRepository } from '../interfaces/global-workspace-repository-state.interface.service';
import { IProviderConfig } from '../types/provider.type';

export function registerConfigCommands(
    panel: vscode.WebviewPanel,
    providerRepository: IGlobalStateRepository<IProviderConfig>,
    outputChannel: vscode.OutputChannel) {

    const handlers = createConfigandlers(panel, providerRepository, outputChannel);

    panel.webview.onDidReceiveMessage(async ({ type, requestId, payload }) => {

        const handler = handlers[type as keyof typeof handlers];
        if (handler) {
            await handler(requestId, payload);
        }
    });
}
