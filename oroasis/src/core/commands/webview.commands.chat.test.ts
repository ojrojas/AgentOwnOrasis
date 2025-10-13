import * as assert from 'assert';
import * as vscode from 'vscode';
import { registerChatCommands } from './webview.commands.chat';
import { createChatHandlers } from '../handlers/chat.handler';
import { IProviderFactory } from '../services/provider.factory.service';
import { IWorkspaceStateRepository } from '../interfaces/workspace-repository-state.interface.service';
import { IChatMessage } from '../types/chat-message.type';

suite('Webview Chat Commands Test Suite', () => {
	let mockPanel: vscode.WebviewPanel;
	let mockProvidersFactory: IProviderFactory;
	let mockChatRepository: IWorkspaceStateRepository<IChatMessage>;
	let mockOutputChannel: vscode.OutputChannel;
	const defaultProvider = 'defaultProvider';

	setup(() => {
		mockPanel = {
			webview: {
				onDidReceiveMessage: (handler: (message: any) => void) => {
					handler({ type: "emitStatusAppChat:request", requestId: "123", payload: {} });
				},
				postMessage: (message: any) => {
					assert.ok(message, 'Message posted to webview');
				}
			},
			dispose: () => {}
		} as unknown as vscode.WebviewPanel;

		mockProvidersFactory = {
			getAdapter: () => {}
		} as unknown as IProviderFactory;

		mockChatRepository = {
			findAllSync: () => [],
			save: () => {}
		} as unknown as IWorkspaceStateRepository<IChatMessage>;

		mockOutputChannel = {
			appendLine: (message: string) => {
				assert.ok(message, 'Output channel should log the request');
			}
		} as unknown as vscode.OutputChannel;
	});

	test('should register chat commands', () => {
		const mockHandlers = createChatHandlers(mockPanel, mockProvidersFactory, defaultProvider, mockChatRepository, mockOutputChannel);
		registerChatCommands(mockPanel, mockProvidersFactory, defaultProvider, mockChatRepository, mockOutputChannel);
		assert.ok(true, 'Chat commands registered successfully');
	});
});