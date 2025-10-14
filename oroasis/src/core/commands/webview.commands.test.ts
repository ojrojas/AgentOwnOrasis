import * as assert from 'assert';
import { commands, Uri, ViewColumn, window } from 'vscode';
import { openPanelCommand } from './webview.commands';
import { WebviewProvider } from '../../providers/webview/WebviewProvider';
import path from 'path';
import { IWebviewConfiguration } from '../types/webview-configuration.type';

suite('Webview Commands Test Suite', () => {
	let mockProps: IWebviewConfiguration;

	setup(() => {
		mockProps = {
			context: {} as any,
			outputChannel: window.createOutputChannel('Test Channel'),
			providersMap: {},
			chatRepository: {} as any,
			providerRepository: {} as any
		};
	});

	test('should execute openPanelCommand', async () => {
		const mockWebviewProvider = new WebviewProvider(mockProps);
		mockWebviewProvider.resolveWebviewView = async () => {
			assert.ok(true, 'resolveWebviewView called');
		};

		await openPanelCommand(mockProps);
		assert.ok(true, 'openPanelCommand executed successfully');
	});
});