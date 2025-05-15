// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { OllamaApiService } from './core/services/ollama.service';
import { helloWorldCommand } from './core/commands/commands.registers';

const outputChannel = vscode.window.createOutputChannel("Oroasis");


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const disposables:vscode.Disposable[] = [];
	const ollamaService = new OllamaApiService();

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	outputChannel.appendLine('Congratulations, your extension "oroasis" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	disposables.push(vscode.commands.registerCommand('oroasis.helloWorld', helloWorldCommand));


	disposables.forEach(dis => {context.subscriptions.push(dis);});
}

// This method is called when your extension is deactivated
export function deactivate() { }
