import * as vscode from 'vscode';
import { IWorkspaceRepositoryService } from '../interfaces/workspace-repository-files.interface.service';

export class WorkspaceRepositoryService implements IWorkspaceRepositoryService {
  
  async getWorkspaceFiles(pattern = '**/*', exclude = '**/node_modules/**'): Promise<string[]> {
    if (!vscode.workspace.workspaceFolders) {
      return [];
    }
    const uris = await vscode.workspace.findFiles(pattern, exclude);
    return uris.map(uri => uri.fsPath);
  }

  async readFileContent(filePath: string): Promise<string> {
    const uri = vscode.Uri.file(filePath);
    const buffer = await vscode.workspace.fs.readFile(uri);
    return Buffer.from(buffer).toString('utf8');
  }

  async writeFileContent(filePath: string, content: string): Promise<void> {
    const uri = vscode.Uri.file(filePath);
    const enc = new TextEncoder();
    await vscode.workspace.fs.writeFile(uri, enc.encode(content));
  }

  async createFile(filePath: string, content = ''): Promise<void> {
    const uri = vscode.Uri.file(filePath);
    const enc = new TextEncoder();
    await vscode.workspace.fs.writeFile(uri, enc.encode(content));
  }

  async deleteFile(filePath: string): Promise<void> {
    const uri = vscode.Uri.file(filePath);
    await vscode.workspace.fs.delete(uri);
  }
}
