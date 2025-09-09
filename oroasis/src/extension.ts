import * as vscode from 'vscode';
import { WorkspaceStateRepository } from './core/services/workspace-repository.service';
import { IWorkspaceStateRepository } from './core/interfaces/workspace-repository-state.interface.service';
import { IChatMessage } from './core/types/chat-message.type';
import { CompletionProvider } from './providers/completions/completion.provider';
import { RefactorProvider } from './providers/codeactions/refactor.provider';
import { WebviewProvider } from "./providers/webview/WebviewProvider";
import { createCommentController } from './core/controllers/comment.controller';
import { CommentComponent } from './providers/comments/comment.provider';
import { registerWebView } from './core/webview/webview.register';
import {
	cancelSaveCommentCommand,
	createCommentCommand,
	deleteAllCommentsCommand,
	deleteCommentCommand,
	editCommentCommand,
	replyCommentCommand,
	saveComentCommand,
} from './core/commands/comment.commands';
import {
	askAgentCommand,
	editAgentCommand,
	updateModelsCommand,
} from './core/commands/agent.commands';
import { openPanelCommand } from './core/commands/webview.commands';
import {
	historyHeaderButtonCommand,
	newHeaderButtonCommand,
	settingsHeaderButtonCommand,
} from './core/commands/headers.commands';
import { registerCommands, registerProvidersAndControllers } from './shared/utils/register.utils';
import { helloWorldCommand } from './core/commands/examples.commands';
import { IProviderFactory } from './core/services/provider.factory.service';
import { providers } from './assets/providers.collection';
import { IProviderConfig } from './core/types/provider.type';

const outputChannel = vscode.window.createOutputChannel("Oroasis");
const disposables: vscode.Disposable[] = [];

//const ollamaService: IProviderApiService = new OllamaApiService();
//ollamaService.udpdateListModels();

function addSubscriber(item: vscode.Disposable) {
	disposables.push(item);
}

export function activate(context: vscode.ExtensionContext) {

	const settings = vscode.workspace.getConfiguration("oroasisSettings");
	const providerName = settings.get<string>('providerDefault') || 'ollama';

	if (providerName === 'ollama') {
		providers.ollama.baseUrl = settings.get<string>('baseUrlProvider') ?? providers.ollama.baseUrl;
	}


	const chatMessageRepository: IWorkspaceStateRepository<IChatMessage> =
		new WorkspaceStateRepository<IChatMessage>('chatMessages', context.workspaceState);

	const providerRepository: IWorkspaceStateRepository<IProviderConfig> =
		new WorkspaceStateRepository<IProviderConfig>('prodivers', context.workspaceState);

	if (!providerRepository.findAllSync()) {
		providerRepository.insertMany([providers.ollama, providers.openai]);
	}

	const completionsProvider = new CompletionProvider(providers);
	const refactorProvider = new RefactorProvider(providers, outputChannel);
	const sideBarWebView = new WebviewProvider(context, outputChannel, providers, chatMessageRepository, providerRepository);

	registerProvidersAndControllers(
		[
			vscode.languages.registerInlineCompletionItemProvider(
				{ pattern: "**" }, completionsProvider),
			vscode.languages.registerCodeActionsProvider(
				{ pattern: "**" },
				refactorProvider,
				{ providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
			),
			registerWebView(sideBarWebView),
			createCommentController(),
		],
		addSubscriber
	);

	// Commands
	registerCommands(
		[
			{ id: 'oroasis.helloWorld', handler: () => helloWorldCommand(outputChannel) },

			// Comments
			{ id: 'oroasis.createComment', handler: (c: vscode.CommentReply) => createCommentCommand(c) },
			{ id: 'oroasis.editComment', handler: (c: CommentComponent) => editCommentCommand(c) },
			{ id: 'oroasis.replyComment', handler: (c: vscode.CommentReply) => replyCommentCommand(c) },
			{ id: 'oroasis.saveComment', handler: (c: CommentComponent) => saveComentCommand(c) },
			{ id: 'oroasis.cancelSaveComment', handler: (c: CommentComponent) => cancelSaveCommentCommand(c) },
			{ id: 'oroasis.deleteComment', handler: (c: CommentComponent) => deleteCommentCommand(c) },
			{ id: 'oroasis.deleteAllComments', handler: (t: vscode.CommentThread) => deleteAllCommentsCommand(t) },


			// Agents
			{
				id: 'oroasis.openChatAgent',
				handler: () => openPanelCommand(
					context,
					outputChannel,
					providers,
					chatMessageRepository,
					providerRepository
				),
			},
			{
				id: 'oroasis.askAgent',
				handler: (c: vscode.CommentReply) => askAgentCommand(
					c,
					providers,
					providerName, // adaptador según proveedor
					outputChannel
				),
			},
			{
				id: 'oroasis.editAgent',
				handler: (c: CommentComponent) => editAgentCommand(
					c,
					providers,
					providerName,
					outputChannel
				),
			},
			{
				id: 'oroasis.updateModels',
				handler: () => updateModelsCommand(
					outputChannel,
					providers,
					providerName
				),
			},

			// Chats
			{ id: 'oroasis.cleanChats', handler: () => chatMessageRepository.clear() },

			// Chats
			{ id: 'oroasis.cleanConfig', handler: () => providerRepository.clear() },

			// Header buttons
			{
				id: 'oroasis.addNewChatButton',
				handler: () => newHeaderButtonCommand(sideBarWebView.view as vscode.WebviewPanel),
			},
			{
				id: 'oroasis.historyChatsButton',
				handler: () => historyHeaderButtonCommand(sideBarWebView.view as vscode.WebviewPanel),
			},
			{
				id: 'oroasis.settingsChatsButton',
				handler: () => settingsHeaderButtonCommand(sideBarWebView.view as vscode.WebviewPanel),
			},
		],
		addSubscriber
	);

	// Register disposables
	disposables.forEach(dis => context.subscriptions.push(dis));

	outputChannel.appendLine('Congratulations, your extension "oroasis" is now active!');
}

export function deactivate() {
	outputChannel.appendLine('Finish, running your extension "oroasis" is now deactive');
}
