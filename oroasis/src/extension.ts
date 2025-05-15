// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { OllamaApiService } from './core/services/ollama.service';
import { helloWorldCommand } from './core/commands/commands.registers';
import { createCommentController } from './core/controllers/comment.controller';

const outputChannel = vscode.window.createOutputChannel("Oroasis");
const disposables: vscode.Disposable[] = [];
const ollamaService = new OllamaApiService();

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	outputChannel.appendLine('Congratulations, your extension "oroasis" is now active!');
	
	// commands
	addSubscriber(vscode.commands.registerCommand('oroasis.helloWorld', helloWorldCommand));
	
	// controllers
	addSubscriber(createCommentController());
	
	disposables.forEach(dis => { context.subscriptions.push(dis); });
}

// This method is called when your extension is deactivated
export function deactivate() { }

function addSubscriber(item: any) {
	disposables.push(item);
}