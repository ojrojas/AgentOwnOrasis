export interface IGlobalStateRepository<T extends { id: string }> {
    insert(entity: T): Promise<void>;
    insertMany(entities: T[]): Promise<void>;
    findAllSync(): T[];
    findById(id: string): T | undefined;
    updateById(id: string, partial: Partial<T>): Promise<void>;
    deleteById(id: string): Promise<void>;
    clear(): Promise<void>;
}