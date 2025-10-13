import * as assert from 'assert';
import * as vscode from 'vscode';
import { RepositoryFactory } from './repository-factory';
import { WorkspaceStateRepository } from '../services/workspace-repository.service';
import { GlobalStateRepository } from '../services/global-repository.service';

suite('RepositoryFactory Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('should create a workspace repository', () => {
		const mockContext = {
			workspaceState: {},
			globalState: {}
		} as unknown as vscode.ExtensionContext;

		const factory = new RepositoryFactory(mockContext);
		const repository = factory.createWorkspaceRepository('testKey');

		assert.ok(repository instanceof WorkspaceStateRepository);
	});

	test('should create a global repository', () => {
		const mockContext = {
			workspaceState: {},
			globalState: {}
		} as unknown as vscode.ExtensionContext;

		const factory = new RepositoryFactory(mockContext);
		const repository = factory.createGlobalRepository('testKey');

		assert.ok(repository instanceof GlobalStateRepository);
	});
});