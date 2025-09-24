export interface IWorkspaceFilesRepositoryService {
  getWorkspaceFiles(pattern?: string, exclude?: string): Promise<string[]>;
  readFileContent(filePath: string): Promise<string>;
  writeFileContent(filePath: string, content: string): Promise<void>;
  createFile(filePath: string, content?: string): Promise<void>;
  deleteFile(filePath: string): Promise<void>;
}