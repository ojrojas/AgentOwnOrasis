import { IFileChange } from "../types/file-change.type";

export interface IPreviewDiffService {
    showDiffPreview(filePath: string, newContent: string): Promise<boolean>;
    showDiffBatch(changes: IFileChange[]): Promise<IFileChange[]>;
}