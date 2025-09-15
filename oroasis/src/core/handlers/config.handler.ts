import * as vscode from 'vscode';
import { IWorkspaceStateRepository } from '../interfaces/workspace-repository-state.interface.service';
import { v4 as uuidv4 } from 'uuid';
import { handleError } from '../../shared/generics/errors';
import { sendToWebview } from '../../shared/utils/chat.utils';
import { IProviderConfig } from '../types/provider.type';

export function createConfigandlers(
    panel: vscode.WebviewPanel,
    providerRepository: IWorkspaceStateRepository<IProviderConfig>,
    outputChannel: vscode.OutputChannel
) {
    const settings = vscode.workspace.getConfiguration('oroasisSettings');
    return {
        "getConfiguration:request": async (requestId: string) => {
            const providers = providerRepository.findAllSync();
            sendToWebview(panel, "getConfiguration:response", requestId, providers);
        },

        "saveConfiguration:request": async (requestId: string, payload: any) => {
            try {
                await providerRepository.clear();
                await providerRepository.insertMany(payload);
                settings.update('modelTemperature', payload?.extraOptions?.temperature || 0.1);
                sendToWebview(panel, "saveConfiguration:response", requestId, { message: 'Configuration saved success' });
            } catch (error) {
                handleError(error, outputChannel, 'Error save configuration');
                sendToWebview(panel, "saveConfiguration:response", requestId, { message: 'Error save configuration' });
            }
        }
    };
}
