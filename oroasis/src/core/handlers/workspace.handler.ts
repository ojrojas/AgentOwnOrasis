import { OutputChannel, WebviewPanel } from "vscode";
import { WorkspaceController } from "../controllers/workspace.controller";
import { sendToWebview } from "../../shared/utils/chat.utils";
import { handleError } from "../../shared/generics/errors";

export function createWorkSpaceHandler(
    panel: WebviewPanel,
    outputChannel: OutputChannel,
    workspaceController: WorkspaceController
) {
    return {
        'listFiles:request': async (requestId: string) => {
            try {
                const files = await workspaceController.listFiles();
                sendToWebview(panel, 'filesList:response', requestId, files);
            } catch (error) {
                handleError(error, outputChannel, "No files obtained or files not found");
                sendToWebview(panel, 'filesList:response', requestId, { models: [] });
            }
        },

        'writeFileWithPreview:request': async (payload: any) => {
            await workspaceController.previewAndSave(payload.path, payload.content);
        },

        'writeFilesBatchWithPreview:request': async (payload: any) => {
            await workspaceController.previewAndSaveBatch(payload.changes);
        },

        'readFile:request': async (requestId: string, payload: any) => {
            try {
                const content = await workspaceController.readFile(payload.path);
                sendToWebview(panel, 'fileContent:response', requestId, {
                    content,
                    path: payload.path
                });
            } catch (error) {
                handleError(error, outputChannel, "No contend found");
                sendToWebview(panel, 'fileContent:response', requestId, { models: [] });
            }
        },

        'writeFile:request': async (payload: any) => {
            await workspaceController.writeFile(payload.path, payload.content);
        },

        'createFile:request': async (payload: any) => {
            await workspaceController.createFile(payload.path, payload.content);
        },

        'deleteFile:request': async (payload: any) => {
            await workspaceController.deleteFile(payload.path);
        }
    };
};