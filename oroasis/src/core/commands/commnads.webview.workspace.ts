import * as vscode from 'vscode';
import { WorkspaceController } from '../controllers/workspace.controller';
import { WorkspaceRepositoryService } from '../services/workspace-repository-files.service';

export function registerWorkspaceCommands(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, outputChannel: vscode.OutputChannel) {
  const workspaceService = new WorkspaceRepositoryService();
  const workspaceController = new WorkspaceController(workspaceService);

  // Mensajes entrantes desde el WebView
  panel.webview.onDidReceiveMessage(async (message) => {
    switch (message.type) {
      case 'listFiles':
        const files = await workspaceController.listFiles(message.pattern, message.exclude);
        panel.webview.postMessage({ type: 'filesList', files });
        break;

      case 'writeFileWithPreview':
        await workspaceController.previewAndSave(message.path, message.content);
        break;

      case 'writeFilesBatchWithPreview':
        await workspaceController.previewAndSaveBatch(message.changes);
        break;

      case 'readFile':
        const content = await workspaceController.readFile(message.path);
        panel.webview.postMessage({ type: 'fileContent', content, path: message.path });
        break;

      case 'writeFile':
        await workspaceController.writeFile(message.path, message.content);
        break;

      case 'createFile':
        await workspaceController.createFile(message.path, message.content);
        break;

      case 'deleteFile':
        await workspaceController.deleteFile(message.path);
        break;
    }
  });
}
