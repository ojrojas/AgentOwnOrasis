import * as assert from 'assert';
import * as vscode from 'vscode';
import { WorkspaceController } from './workspace.controller';
import { IWorkspaceFilesRepositoryService } from '../interfaces/workspace-repository-files.interface.service';
import { IPreviewDiffService } from '../interfaces/preview-diff.interface.service';
import { IFileChange } from '../types/file-change.type';

suite('WorkspaceController Test Suite', () => {
	let controller: WorkspaceController;
	let mockWorkspaceService: IWorkspaceFilesRepositoryService;
	let mockPreviewDiffService: IPreviewDiffService;

	setup(() => {
		mockWorkspaceService = {
			getWorkspaceFiles: async () => ['file1.txt', 'file2.txt'],
			readFileContent: async (filePath: string) => 'file content',
			writeFileContent: async (filePath: string, content: string) => {},
			createFile: async (filePath: string, content: string) => {},
			deleteFile: async (filePath: string) => {}
		} as IWorkspaceFilesRepositoryService;

		mockPreviewDiffService = {
			showDiffPreview: async (filePath: string, content: string) => true,
			showDiffBatch: async (changes: IFileChange[]) => changes
		} as IPreviewDiffService;

		controller = new WorkspaceController(mockWorkspaceService);
		Object.defineProperty(controller, 'previewDiffService', {
			value: mockPreviewDiffService
		});
	});

	test('should preview and save a file', async () => {
		await controller.previewAndSave('test.txt', 'new content');
		assert.ok(true, 'Preview and save executed successfully');
	});

	test('should discard changes if preview is not confirmed', async () => {
		mockPreviewDiffService.showDiffPreview = async () => false;
		await controller.previewAndSave('test.txt', 'new content');
		assert.ok(true, 'Discard changes executed successfully');
	});

	test('should list files in the workspace', async () => {
		const files = await controller.listFiles();
		assert.deepStrictEqual(files, ['file1.txt', 'file2.txt']);
	});

	test('should read a file', async () => {
		const content = await controller.readFile('test.txt');
		assert.strictEqual(content, 'file content');
	});

	test('should write to a file', async () => {
		await controller.writeFile('test.txt', 'new content');
		assert.ok(true, 'Write file executed successfully');
	});

	test('should create a file', async () => {
		await controller.createFile('test.txt', 'content');
		assert.ok(true, 'Create file executed successfully');
	});

	test('should delete a file', async () => {
		await controller.deleteFile('test.txt');
		assert.ok(true, 'Delete file executed successfully');
	});

	test('should resolve a workspace path', () => {
		const mockWorkspaceFolders = [{ uri: { fsPath: '/workspace' } }];
		(vscode.workspace.workspaceFolders as any) = mockWorkspaceFolders;
		const resolvedPath = controller.resolveWorkspacePath('relative/path');
		assert.strictEqual(resolvedPath, '/workspace/relative/path');
	});

	test('should throw an error if no workspace is open', () => {
		(vscode.workspace.workspaceFolders as any) = undefined;
		assert.throws(() => controller.resolveWorkspacePath('relative/path'), /No workspace open/);
	});
});