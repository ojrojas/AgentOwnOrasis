import { commands, Position, Uri, window, workspace, WorkspaceEdit } from 'vscode';
import { IPreviewDiffService } from "../interfaces/preview-diff.interface.service";
import { IFileChange } from '../types/file-change.type';

export class PreviewDiffService implements IPreviewDiffService {

    async showDiffBatch(changes: IFileChange[]): Promise<IFileChange[]> {
        const confirmed: IFileChange[] = [];

        for (const change of changes) {
            const ok = await this.showDiffPreview(change.path, change.newContent);
            if (ok) {
                confirmed.push(change);
            }
        }

        return confirmed;
    }


    async showDiffPreview(filePath: string, newContent: string): Promise<boolean> {
        const originalUri = Uri.file(filePath);
        const tempUri = Uri.parse(`untitled:${filePath}.proposed`);

        const doc = await workspace.openTextDocument(tempUri);
        const edit = new WorkspaceEdit();
        edit.insert(tempUri, new Position(0, 0), newContent);
        await workspace.applyEdit(edit);

        await commands.executeCommand(
            'vscode.diff',
            originalUri,
            tempUri,
            `Propossed changes: ${filePath}`
        );

        const choice = await window.showInformationMessage(
            `Do you want to apply the changes in, ${filePath}?`,
            { modal: true },
            'Yes', 'No'
        );

        return choice === 'Yes';
    }
}