// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { OllamaApiService } from './core/services/ollama.service';
import { createCommand, helloWorldCommand } from './core/commands/commands.registers';
import { createCommentController } from './core/controllers/comment.controller';
import { CommentComponent } from './providers/comments/comment.provider';
import { cancelSaveCommentCommand, createCommentCommand, deleteAllCommentsCommand, deleteCommentCommand, editCommentCommand, replyCommentCommand, saveComentCommand } from './core/commands/commands.comment';
import { askAgentCommand, editAgentCommand, updateModelsCommand } from './core/commands/commands.agent';
import { openPanelCommand } from './core/commands/commands.webview';
import { IOllamaApiService } from './core/services/ollama.interface.service';

const outputChannel = vscode.window.createOutputChannel("Oroasis");
const disposables: any[] = [];
const ollamaService: IOllamaApiService = new OllamaApiService();
ollamaService.udpdateModels();

function addSubscriber(item: any) {
	disposables.push(item);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	outputChannel.appendLine('Congratulations, your extension "oroasis" is now active!');

	// controllers
	addSubscriber(createCommentController());

	// commands sample
	addSubscriber(createCommand('oroasis.helloWorld', () => helloWorldCommand(outputChannel)));
	// commands comments
	addSubscriber(createCommand('oroasis.createComment', (commentReply: vscode.CommentReply) => createCommentCommand(commentReply)));
	addSubscriber(createCommand('oroasis.editComment', (comment: CommentComponent) => editCommentCommand(comment)));
	addSubscriber(createCommand('oroasis.replyComment', (commentReply: vscode.CommentReply) => replyCommentCommand(commentReply)));
	addSubscriber(createCommand('oroasis.saveComment', (comment: CommentComponent) => saveComentCommand(comment)));
	addSubscriber(createCommand('oroasis.cancelSaveComment', (comment: CommentComponent) => cancelSaveCommentCommand(comment)));
	addSubscriber(createCommand('oroasis.deleteComment', (comment: CommentComponent) => deleteCommentCommand(comment)));
	addSubscriber(createCommand('oroasis.deleteAllComments', (thread: vscode.CommentThread) => deleteAllCommentsCommand(thread)));

	// commands agent
	addSubscriber(createCommand('oroasis.openChatAgent', () => openPanelCommand(outputChannel)));
	addSubscriber(createCommand('oroasis.askAgent', (commentReply:vscode.CommentReply) => askAgentCommand(commentReply, ollamaService, outputChannel)));
	addSubscriber(createCommand('oroasis.editAgent', (commentReply:vscode.CommentReply) => editAgentCommand(commentReply, ollamaService, outputChannel)));
	addSubscriber(createCommand('oroasis.updateModels', () => updateModelsCommand(outputChannel, ollamaService)));

	disposables.forEach(dis => {
		context.subscriptions.push(dis);
	});
}

// This method is called when your extension is deactivated
export function deactivate() { }