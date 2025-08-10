import * as vscode from 'vscode';
import { WorkspaceController } from '../controllers/workspace.controller';
import { WorkspaceRepositoryService } from '../services/workspace-repository-files.service';

export function registerWorkspaceCommands(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, outputChannel: vscode.OutputChannel) {
  const workspaceService = new WorkspaceRepositoryService();
  const workspaceController = new WorkspaceController(workspaceService);

  panel.webview.onDidReceiveMessage(async (message) => {
      const { type, requestId, payload } = message;
    switch (type) {
      case 'listFiles:request':
        const files = await workspaceController.listFiles();
        panel.webview.postMessage({ 
          type: 'filesList:response',
          requestId,
          payload: files });
        break;

      case 'writeFileWithPreview:request':
        await workspaceController.previewAndSave(payload.path, payload.content);
        break;

      case 'writeFilesBatchWithPreview:request':
        await workspaceController.previewAndSaveBatch(payload.changes);
        break;

      case 'readFile:request':
        const content = await workspaceController.readFile(payload.path);
        panel.webview.postMessage(
          { type: 'fileContent:response', 
            requestId,
            payload: {
              content, 
              path: payload.path 
            }});
        break;

      case 'writeFile:request':
        await workspaceController.writeFile(payload.path, payload.content);
        break;

      case 'createFile:request':
        await workspaceController.createFile(payload.path, payload.content);
        break;

      case 'deleteFile:request':
        await workspaceController.deleteFile(payload.path);
        break;
    }
  });
}
