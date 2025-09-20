import { ExtensionContext } from "vscode";
import { WorkspaceStateRepository } from "../services/workspace-repository.service";
import { GlobalStateRepository } from "../services/global-repository.service";
import { IRepositoryFactory } from "../interfaces/repository-factory.interface.service";

export class RepositoryFactory implements IRepositoryFactory {
    constructor(private context: ExtensionContext) { }

    createWorkspaceRepository<T extends { id: string }>(key: string) {
        return new WorkspaceStateRepository<T>(key, this.context.workspaceState);
    }

    createGlobalRepository<T extends { id: string }>(key: string) {
        return new GlobalStateRepository<T>(key, this.context.globalState);
    }
}