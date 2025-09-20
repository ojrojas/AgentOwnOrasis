import * as vscode from 'vscode';
import { handleError } from '../../shared/generics/errors';
import { sendToWebview } from '../../shared/utils/chat.utils';
import { IProviderConfig } from '../types/provider.type';
import { IGlobalStateRepository } from '../interfaces/global-workspace-repository-state.interface.service';

export function createConfigandlers(
    panel: vscode.WebviewPanel,
    providerGlobalStateRepository: IGlobalStateRepository<IProviderConfig>,
    outputChannel: vscode.OutputChannel
) {
    const settings = vscode.workspace.getConfiguration('oroasis-settings');
    return {
        "getConfiguration:request": async (requestId: string) => {
            const providers = providerGlobalStateRepository.findAllSync();
            sendToWebview(panel, "getConfiguration:response", requestId, providers);
        },

        "saveConfiguration:request": async (requestId: string, payload: any) => {
            try {
                await providerGlobalStateRepository.clear();
                await providerGlobalStateRepository.insertMany(payload);
                settings.update('modelTemperature', payload?.extraOptions?.temperature || 0.1);
                sendToWebview(panel, "saveConfiguration:response", requestId, { message: 'Configuration saved success' });
            } catch (error) {
                handleError(error, outputChannel, 'Error save configuration');
                sendToWebview(panel, "saveConfiguration:response", requestId, { message: 'Error save configuration' });
            }
        }
    };
}
