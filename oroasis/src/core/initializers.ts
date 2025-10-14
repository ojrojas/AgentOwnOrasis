import * as vscode from 'vscode';
import { RepositoryFactory } from './factories/repository-factory';
import { IWorkspaceStateRepository } from './interfaces/workspace-repository-state.interface.service';
import { IChatMessage } from './types/chat-message.type';
import { IGlobalStateRepository } from './interfaces/global-workspace-repository-state.interface.service';
import { IProviderConfig } from './types/provider.type';
import { providers } from '../assets/providers.collection';

export function initializeRepositories(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) {
	const repositoryFactory = new RepositoryFactory(context);
	const chatMessageRepository: IWorkspaceStateRepository<IChatMessage> = repositoryFactory.createWorkspaceRepository('oroasis-chats-repository');
	const providerRepository: IGlobalStateRepository<IProviderConfig> = repositoryFactory.createGlobalRepository('oroasis-provider-repository');

	const settings = vscode.workspace.getConfiguration("oroasisSettings");
	const providerName = settings.get<string>('providerDefault') || 'ollama';

	if (providerName === 'ollama') {
		providers.ollama.baseUrl = settings.get<string>('baseUrlProvider') ?? providers.ollama.baseUrl;
	}

	const providersExist = providerRepository.findAllSync();
	if (providersExist.length === 0) {
		providerRepository.insertMany([providers.ollama, providers.openai]);
	}

	return { chatMessageRepository, providerRepository, providers, providerName };
}

export function initializeProviders(providers: any, outputChannel: vscode.OutputChannel) {
	const CompletionProvider = require('../providers/completions/completion.provider').CompletionProvider;
	const RefactorProvider = require('../providers/codeactions/refactor.provider').RefactorProvider;

	const completionsProvider = new CompletionProvider(providers);
	const refactorProvider = new RefactorProvider(providers, outputChannel);

	return { completionsProvider, refactorProvider };
}