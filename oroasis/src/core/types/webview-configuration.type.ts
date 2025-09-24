import { ExtensionContext, OutputChannel } from "vscode";
import { IProviderConfig, ProvidersMap } from "./provider.type";
import { IWorkspaceStateRepository } from "../interfaces/workspace-repository-state.interface.service";
import { IChatMessage } from "./chat-message.type";
import { IGlobalStateRepository } from "../interfaces/global-workspace-repository-state.interface.service";

export interface IWebviewConfiguration {
    context: ExtensionContext;
    outputChannel: OutputChannel;
    providersMap: ProvidersMap;
    chatRepository: IWorkspaceStateRepository<IChatMessage>;
    providerRepository: IGlobalStateRepository<IProviderConfig>
}