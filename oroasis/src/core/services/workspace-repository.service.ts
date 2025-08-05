import * as vscode from 'vscode';

export class WorkspaceStateRepository<T extends { id: string }> {
  constructor(
    private storageKey: string,
    private workspaceState: vscode.Memento
  ) {}

  async insert(entity: T): Promise<void> {
    const data = this.findAllSync();
    data.push(entity);
    await this.workspaceState.update(this.storageKey, data);
  }

  async insertMany(entities: T[]): Promise<void> {
    const data = this.findAllSync();
    await this.workspaceState.update(this.storageKey, [...data, ...entities]);
  }

  findAllSync(): T[] {
    return this.workspaceState.get<T[]>(this.storageKey, []);
  }

  findById(id: string): T | undefined {
    return this.findAllSync().find(item => item.id === id);
  }

  async updateById(id: string, partial: Partial<T>): Promise<void> {
    const data = this.findAllSync();
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...partial };
      await this.workspaceState.update(this.storageKey, data);
    }
  }

  async deleteById(id: string): Promise<void> {
    const data = this.findAllSync().filter(item => item.id !== id);
    await this.workspaceState.update(this.storageKey, data);
  }

  async clear(): Promise<void> {
    await this.workspaceState.update(this.storageKey, []);
  }
}
