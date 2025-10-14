import * as vscode from 'vscode';
import { WebviewProvider } from '../../providers/webview/WebviewProvider';
import { registerWebView } from './webview.register';

export function createWebviewPanel() {
	return vscode.window.createWebviewPanel(
		'webview',
		'Oroasis Webview',
		vscode.ViewColumn.One,
		{
			retainContextWhenHidden: true
		}
	);
}

export function initializeWebviewProvider(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel, providers: any, chatRepository: any, providerRepository: any) {
	const propertiesWebViewProvider = {
		context,
		outputChannel,
		providersMap: providers,
		chatRepository,
		providerRepository,
	};

	const webviewProvider = new WebviewProvider(propertiesWebViewProvider);
	registerWebView(webviewProvider);

	return webviewProvider;
}