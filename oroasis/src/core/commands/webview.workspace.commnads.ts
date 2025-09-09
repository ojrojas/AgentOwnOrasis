import * as vscode from 'vscode';
import { WorkspaceController } from '../controllers/workspace.controller';
import { WorkspaceRepositoryService } from '../services/workspace-repository-files.service';
import { createWorkSpaceHandler } from '../handlers/workspace.handler';

export function registerWorkspaceCommands(
  context: vscode.ExtensionContext,
  panel: vscode.WebviewPanel,
  outputChannel: vscode.OutputChannel) {
  const workspaceService = new WorkspaceRepositoryService();
  const workspaceController = new WorkspaceController(workspaceService);

  const handlers = createWorkSpaceHandler(panel, outputChannel, workspaceController);

  panel.webview.onDidReceiveMessage(async ({ type, requestId, payload }) => {

    const handler = handlers[type as keyof typeof handlers];
    if (handler) {
      await handler(requestId, payload);
    }
  });
}
