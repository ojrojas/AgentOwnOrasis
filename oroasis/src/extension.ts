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
import { IOllamaApiService } from './core/interfaces/ollama.interface.service';
import { CompletionProvider } from './providers/completions/completion.provider';
import { WebviewProvider } from './providers/webview/webview.provider';
import { registerWebView } from './core/webview/webview.register';
import { WorkspaceStateRepository } from './core/services/workspace-repository.service';
import { IChatMessage } from './core/types/chat-message.type';
import { IWorkspaceStateRepository } from './core/interfaces/workspace-repository-state.interface.service';
import { RefactorProvider } from './providers/codeactions/refactor.provider';

const outputChannel = vscode.window.createOutputChannel("Oroasis");
const disposables: any[] = [];
const ollamaService: IOllamaApiService = new OllamaApiService();
ollamaService.udpdateListModels();

function addSubscriber(item: any) {
	disposables.push(item);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const chatMessageRepository: IWorkspaceStateRepository<IChatMessage> = new WorkspaceStateRepository<IChatMessage>('chatMessages', context.workspaceState);

	const completionsProvider = new CompletionProvider(ollamaService);
	const refactorProvider = new RefactorProvider(ollamaService);
	const sideBarWebView = new WebviewProvider(context, outputChannel, ollamaService, chatMessageRepository);
	
	// providers
	addSubscriber(vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, completionsProvider));
	addSubscriber(vscode.languages.registerCodeActionsProvider({ pattern: "**" }, refactorProvider,  { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }));
	addSubscriber(registerWebView(sideBarWebView));
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
	addSubscriber(createCommand('oroasis.openChatAgent', () => openPanelCommand(context, outputChannel, ollamaService, chatMessageRepository)));
	addSubscriber(createCommand('oroasis.askAgent', (commentReply: vscode.CommentReply) => askAgentCommand(commentReply, ollamaService, outputChannel)));
	addSubscriber(createCommand('oroasis.editAgent', (comment: CommentComponent) => editAgentCommand(comment, ollamaService, outputChannel)));
	addSubscriber(createCommand('oroasis.updateModels', () => updateModelsCommand(outputChannel, ollamaService)));

	// command chats
	addSubscriber(createCommand('oroasis.cleanChats', () => chatMessageRepository.clear()));


	disposables.forEach(dis => {
		context.subscriptions.push(dis);
	});

	outputChannel.appendLine('Congratulations, your extension "oroasis" is now active!');
}

// This method is called when your extension is deactivated
export function deactivate() { 
	outputChannel.appendLine('Finish, running your extension "oroasis" is now deactive');
}