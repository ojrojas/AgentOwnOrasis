import * as assert from 'assert';
import * as vscode from 'vscode';
import { createChatHandlers } from './chat.handler';
import { IProviderFactory } from '../services/provider.factory.service';
import { IWorkspaceStateRepository } from '../interfaces/workspace-repository-state.interface.service';
import { IChatMessage } from '../types/chat-message.type';

suite('Chat Handlers Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('should retrieve models from the provider', async () => {
		const mockPanel = {} as vscode.WebviewPanel;
		const mockProvidersFactory = {
			getAdapter: (providerName: string) => {
				assert.strictEqual(providerName, 'defaultProvider');
				return {
					listModels: async () => ['model1', 'model2'],
					sendMessage: async () => 'Response from AI'
				};
			}
		} as unknown as IProviderFactory;
		const mockChatRepository = {
			findAllSync: () => [{ id: '1', content: 'Hello' }],
			save: () => {}
		} as unknown as IWorkspaceStateRepository<IChatMessage>;
		const mockOutputChannel = {
			appendLine: (message: string) => {
				assert.ok(message.includes('Provider error'));
			}
		} as unknown as vscode.OutputChannel;

		const handlers = createChatHandlers(
			mockPanel,
			mockProvidersFactory,
			'defaultProvider',
			mockChatRepository,
			mockOutputChannel
		);

		let modelsResponse;
		const mockSendToWebview = (panel: vscode.WebviewPanel, event: string, requestId: string, data: any) => {
			if (event === 'getModels:response') {
				modelsResponse = data;
			}
		};

		await handlers['getModels:request']('requestId');

		assert.deepStrictEqual(modelsResponse, ['model1', 'model2']);
	});

	test('should fetch all messages from the repository', async () => {
		const mockPanel = {} as vscode.WebviewPanel;
		const mockProvidersFactory = {
			getAdapter: () => ({
				listModels: async () => ['model1', 'model2'],
				sendMessage: async () => 'Response from AI'
			})
		} as unknown as IProviderFactory;
		const mockChatRepository = {
			findAllSync: () => [{ id: '1', content: 'Hello' }],
			save: () => {}
		} as unknown as IWorkspaceStateRepository<IChatMessage>;
		const mockOutputChannel = {
			appendLine: () => {}
		} as unknown as vscode.OutputChannel;

		const handlers = createChatHandlers(
			mockPanel,
			mockProvidersFactory,
			'defaultProvider',
			mockChatRepository,
			mockOutputChannel
		);

		let allMessagesResponse;
		const mockSendToWebview = (panel: vscode.WebviewPanel, event: string, requestId: string, data: any) => {
			if (event === 'getAllMessages:response') {
				allMessagesResponse = data;
			}
		};

		await handlers['getAllMessages:request']('requestId');

		assert.deepStrictEqual(allMessagesResponse, [{ id: '1', content: 'Hello' }]);
	});

	test('should handle chat requests and include tools in the payload', async () => {
		const mockPanel = {} as vscode.WebviewPanel;
		const mockProvidersFactory = {
			getAdapter: () => ({
				listModels: async () => ['model1', 'model2'],
				sendMessage: async () => 'Response from AI'
			})
		} as unknown as IProviderFactory;
		const mockChatRepository = {
			findAllSync: () => [{ id: '1', content: 'Hello' }],
			save: () => {}
		} as unknown as IWorkspaceStateRepository<IChatMessage>;
		const mockOutputChannel = {
			appendLine: () => {}
		} as unknown as vscode.OutputChannel;

		const handlers = createChatHandlers(
			mockPanel,
			mockProvidersFactory,
			'defaultProvider',
			mockChatRepository,
			mockOutputChannel
		);

		let sendChatResponse;
		const mockSendSafe = (panel: vscode.WebviewPanel, event: string, outputChannel: vscode.OutputChannel, requestId: string, data: any) => {
			if (event === 'sendChat:response:done') {
				sendChatResponse = data;
			}
		};

		const payload = {
			content: 'Test message',
			files: [],
			provider: 'defaultProvider',
			role: 'user',
			type: 'Ask'
		};

		await handlers['sendChat:request']('requestId', payload);

		assert.ok(sendChatResponse);
	});

	test('should handle an empty message gracefully', async () => {
		const mockPanel = {} as vscode.WebviewPanel;
		const mockProvidersFactory = {
			getAdapter: () => ({
				listModels: async () => ['model1', 'model2'],
				sendMessage: async () => 'Response from AI'
			})
		} as unknown as IProviderFactory;
		const mockChatRepository = {
			findAllSync: () => [{ id: '1', content: 'Hello' }],
			save: () => {}
		} as unknown as IWorkspaceStateRepository<IChatMessage>;
		const mockOutputChannel = {
			appendLine: () => {}
		} as unknown as vscode.OutputChannel;

		const handlers = createChatHandlers(
			mockPanel,
			mockProvidersFactory,
			'defaultProvider',
			mockChatRepository,
			mockOutputChannel
		);

		let sendChatResponse;
		const mockSendSafe = (panel: vscode.WebviewPanel, event: string, outputChannel: vscode.OutputChannel, requestId: string, data: any) => {
			if (event === 'sendChat:response:done') {
				sendChatResponse = data;
			}
		};

		const payload = {
			content: '',
			files: [],
			provider: 'defaultProvider',
			role: 'user',
			type: 'Ask'
		};

		await handlers['sendChat:request']('requestId', payload);

		assert.ok(sendChatResponse);
	});

	test('should log an error if the provider fails', async () => {
		const mockPanel = {} as vscode.WebviewPanel;
		const mockProvidersFactory = {
			getAdapter: () => ({
				listModels: async () => ['model1', 'model2'],
				generate: async () => {},
				chat: async () => {},
				sendMessage: async () => { throw new Error('Provider error'); }
			})
		} as unknown as IProviderFactory;
		const mockChatRepository = {
			findAllSync: () => [{ id: '1', content: 'Hello' }],
			save: () => {}
		} as unknown as IWorkspaceStateRepository<IChatMessage>;
		const mockOutputChannel = {
			appendLine: (message: string) => {
				assert.ok(message.includes('Provider error'));
			}
		} as unknown as vscode.OutputChannel;

		const handlers = createChatHandlers(
			mockPanel,
			mockProvidersFactory,
			'defaultProvider',
			mockChatRepository,
			mockOutputChannel
		);

		let errorResponse;
		const mockSendSafe = (panel: vscode.WebviewPanel, event: string, outputChannel: vscode.OutputChannel, requestId: string, data: any) => {
			if (event === 'sendChat:response:error') {
				errorResponse = data;
			}
		};

		const payload = {
			content: 'Test message',
			files: [],
			provider: 'defaultProvider',
			role: 'user',
			type: 'Ask'
		};

		await handlers['sendChat:request']('requestId', payload);

		assert.ok(errorResponse);
	});
});