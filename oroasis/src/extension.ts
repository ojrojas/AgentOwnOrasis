// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { OllamaApiService } from './core/services/ollama.service';
import { askAgentCommand, createCommand, createCommentCommand, editAgentCommand, helloWorldCommand, openPanelCommand } from './core/commands/commands.registers';
import { createCommentController } from './core/controllers/comment.controller';

const outputChannel = vscode.window.createOutputChannel("Oroasis");
const disposables: vscode.Disposable[] = [];
const ollamaService = new OllamaApiService();

function addSubscriber(item: any) {
	disposables.push(item);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	outputChannel.appendLine('Congratulations, your extension "oroasis" is now active!');

	// controllers
	addSubscriber(createCommentController());
	
	// commands
	addSubscriber(createCommand('oroasis.helloWorld', (outputChannel) => helloWorldCommand));
	addSubscriber(createCommand('oroasis.openChatAgent', (outputChannel) => openPanelCommand));
	addSubscriber(createCommand('oroasis.createComment', (commentReply: vscode.CommentReply) => createCommentCommand));
	addSubscriber(createCommand('oroasis.askAgent', (outputChannel) => askAgentCommand));
	addSubscriber(createCommand('oroasis.editAgent', (outputChannel) => editAgentCommand));


	disposables.forEach(dis => { context.subscriptions.push(dis); });
}

// This method is called when your extension is deactivated
export function deactivate() { }