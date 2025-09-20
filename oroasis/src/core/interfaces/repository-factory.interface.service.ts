import { GlobalStateRepository } from "../services/global-repository.service";
import { WorkspaceStateRepository } from "../services/workspace-repository.service";

export interface IRepositoryFactory {
    createWorkspaceRepository<T extends { id: string }>(key: string): WorkspaceStateRepository<T>;
    createGlobalRepository<T extends { id: string }>(key: string): GlobalStateRepository<T>;
}