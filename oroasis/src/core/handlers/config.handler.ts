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
    const preferredModel = settings.get('modelDefault');
    const temperature = parseFloat(settings.get('modelTemperature') as string) || 0.1;
    const promptDefault = settings.get('templatePromptGenerate') as string;

    return {
        "getConfiguration": async (requestId: string) => {
            sendToWebview(panel, "getConfiguration:response", requestId);
        },

        "saveConfiguration": async (requestId: string, payload: any) => {
            try {
                await providerRepository.insert(payload);
                sendToWebview(panel, "saveConfiguration:response", requestId, { message: 'Configuration saved success' });
            } catch (error) {
                handleError(error, outputChannel, 'Error save configuration');
                sendToWebview(panel, "saveConfiguration:response", requestId, { message: 'Error save configuration' });
            }
        }
    };
}
