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
      vscode.window.showInformationMessage(`Archivo actualizado: ${filePath}`);
    } else {
      vscode.window.showInformationMessage(`Cambios descartados para: ${filePath}`);
    }
  }

  async previewAndSaveBatch(changes: IFileChange[]) {
    const confirmed = await this.previewDiffService.showDiffBatch(changes);

    for (const change of confirmed) {
      await this.workspaceService.writeFileContent(change.path, change.newContent);
      vscode.window.showInformationMessage(`Archivo actualizado: ${change.path}`);
    }

    if (confirmed.length === 0) {
      vscode.window.showWarningMessage('No se aplicaron cambios.');
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
    vscode.window.showInformationMessage(`Archivo actualizado: ${filePath}`);
  }

  async createFile(filePath: string, content = '') {
    await this.workspaceService.createFile(filePath, content);
    vscode.window.showInformationMessage(`Archivo creado: ${filePath}`);
  }

  async deleteFile(filePath: string) {
    await this.workspaceService.deleteFile(filePath);
    vscode.window.showInformationMessage(`Archivo eliminado: ${filePath}`);
  }
}
