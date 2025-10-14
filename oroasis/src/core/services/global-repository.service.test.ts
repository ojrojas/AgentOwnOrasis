import * as assert from 'assert';
import * as vscode from 'vscode';
import { GlobalStateRepository } from './global-repository.service';

suite('GlobalStateRepository Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('should be defined', () => {
		const mockMemento = {
			get: () => [],
			update: () => {}
		} as unknown as vscode.Memento;
		const service = new GlobalStateRepository('testKey', mockMemento);
		assert.ok(service);
	});

	test('should initialize with an empty repository', () => {
		const mockMemento = {
			get: () => [],
			update: () => {}
		} as unknown as vscode.Memento;
		const service = new GlobalStateRepository('testKey', mockMemento);
		assert.deepStrictEqual(service.findAllSync(), []);
	});

	test('should add an item to the repository', async () => {
		const mockMemento = {
			get: () => [],
			update: (key: string, value: any) => {
				assert.strictEqual(key, 'testKey');
				assert.deepStrictEqual(value, [{ id: '1', name: 'Test Item' }]);
			}
		} as unknown as vscode.Memento;
		const service = new GlobalStateRepository('testKey', mockMemento);
		const item = { id: '1', name: 'Test Item' };
		await service.insert(item);
	});

	test('should remove an item from the repository', async () => {
		const item = { id: '1', name: 'Test Item' };
		const mockMemento = {
			get: () => [item],
			update: (key: string, value: any) => {
				assert.strictEqual(key, 'testKey');
				assert.deepStrictEqual(value, []);
			}
		} as unknown as vscode.Memento;
		const service = new GlobalStateRepository('testKey', mockMemento);
		await service.deleteById(item.id);
	});
});