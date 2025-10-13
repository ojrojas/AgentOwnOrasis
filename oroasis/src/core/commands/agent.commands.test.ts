import * as assert from 'assert';
import { askAgentCommand, updateModelsCommand } from './agent.commands';
import { OutputChannel, CommentReply, CommentThread, MarkdownString, window, workspace } from 'vscode';
import { IProviderFactory } from '../services/provider.factory.service';
import { ProvidersMap } from '../types/provider.type';
import { IChatRequest, IMessage } from '../types/chat-message.type';

suite('Agent Commands Test Suite', () => {
	let mockOutputChannel: OutputChannel;
	let mockProvidersMap: ProvidersMap;

	setup(() => {
		mockOutputChannel = {
			appendLine: (message: string) => {
				assert.ok(message);
			}
		} as unknown as OutputChannel;

		mockProvidersMap = {
			provider1: {
				id: 'provider1',
				isSelected: true,
				baseUrl: 'https://api.example.com',
				apiKey: 'test-api-key'
			}
		};
	});

	test('should execute askAgentCommand', async () => {
		const mockCommentReply = {
			thread: {} as CommentThread,
			text: 'Test question'
		} as CommentReply;

		await askAgentCommand(mockCommentReply, mockProvidersMap, 'provider1', mockOutputChannel);
		assert.ok(true, 'askAgentCommand executed successfully');
	});

	test('should execute updateModelsCommand', async () => {
		await updateModelsCommand(mockOutputChannel, mockProvidersMap, 'provider1');
		assert.ok(true, 'updateModelsCommand executed successfully');
	});
});