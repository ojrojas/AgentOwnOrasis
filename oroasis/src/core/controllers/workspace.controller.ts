import * as vscode from 'vscode';
import { WorkspaceRepositoryService } from '../services/workspace-repository-files.service';
import { IPreviewDiffService } from '../interfaces/preview-diff.interface.service';
import { PreviewDiffService } from '../services/preview-diff.service';
import { IFileChange } from '../types/file-change.type';

export class WorkspaceController {
  readonly previewDiffService: IPreviewDiffService = new PreviewDiffService();
  constructor(private workspaceService: WorkspaceRepositoryService) { }

  async previewAndSave(filePath: string, newContent: string) {
    const confirm = await this.previewDiffService.showDiffPreview(filePath, newContent);

    if (confirm) {
      await this.workspaceService.writeFileContent(filePath, newContent);
      vscode.window.showInformationMessage(`Updated file: ${filePath}`);
    } else {
      vscode.window.showInformationMessage(`Discard changes for: ${filePath}`);
    }
  }

  async previewAndSaveBatch(changes: IFileChange[]) {
    const confirmed = await this.previewDiffService.showDiffBatch(changes);

    for (const change of confirmed) {
      await this.workspaceService.writeFileContent(change.path, change.newContent);
      vscode.window.showInformationMessage(`Preview and update file: ${change.path}`);
    }

    if (confirmed.length === 0) {
      vscode.window.showWarningMessage('No apply changes to file.');
    }
  }

  async listFiles(pattern?: string, exclude?: string) {
    return await this.workspaceService.getWorkspaceFiles(pattern, exclude);
  }

  async readFile(filePath: string) {
    return await this.workspaceService.readFileContent(filePath);
  }

  async writeFile(filePath: string, content: string) {
    await this.workspaceService.writeFileContent(filePath, content);
    vscode.window.showInformationMessage(`Wirte file success: ${filePath}`);
  }

  async createFile(filePath: string, content = '') {
    await this.workspaceService.createFile(filePath, content);
    vscode.window.showInformationMessage(`Created file success: ${filePath}`);
  }

  async deleteFile(filePath: string) {
    await this.workspaceService.deleteFile(filePath);
    vscode.window.showInformationMessage(`Deleted file success: ${filePath}`);
  }
}
