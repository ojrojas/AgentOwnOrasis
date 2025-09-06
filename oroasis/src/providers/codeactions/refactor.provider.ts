import {
    CancellationToken,
    CodeAction,
    CodeActionContext,
    CodeActionKind,
    CodeActionProvider,
    Command,
    OutputChannel,
    Range,
    Selection,
    TextDocument,
    window,
    workspace,
    WorkspaceEdit,
} from 'vscode';
import { IOllamaApiService } from '../../core/interfaces/provider.interface.service';

export class RefactorProvider implements CodeActionProvider {

    constructor(private ollamaService: IOllamaApiService,private outputChannel: OutputChannel) { }
    async provideCodeActions(
        document: TextDocument,
        range: Range | Selection,
        context: CodeActionContext,
        token: CancellationToken): Promise<(CodeAction | Command)[] | null | undefined> {
        const settings = workspace.getConfiguration('oroasisSettings');
        const roleAgent = settings.get<string>('templatePromptRefactor');
        const model = settings.get<string>('modelDefault');
        const languageId = document.languageId;

        if(!roleAgent || !model) {
            this.outputChannel.appendLine("There are no saved settings for Oroasis extension -> extensions -> oroasis settings");
            return null;
        }

        if (token.isCancellationRequested) {
            return null;
        }

        if (document.uri.scheme === "vscode-scm") {
            return null;
        }

        const editor = window.activeTextEditor;
        if (!editor || editor.selections.length > 1) {
            return null;
        }

        const codeContext = document.getText(range).trim();

        if (codeContext.length <= 0) { return null; }

        const request = `${roleAgent}. Here is the context:${codeContext}, only return valid ${languageId} code`;

        try {

            const response = await this.ollamaService.generate({
                model: model as string,
                prompt: request,
                options: { temperature: 0.0, top_p: 0.95, repeat_penalty: 1.5, num_predict: 140, }
            });
            let accumulated = '';
            for await (const chunk of response) {
                accumulated += chunk.response;
            }

            if (token.isCancellationRequested) {
                return null;
            }

            accumulated = this.cleanResponse(accumulated).trim();
            console.log("refactor:" + accumulated);

            const action = new CodeAction("AI: Improve code from oroasis", CodeActionKind.QuickFix);
            action.edit = new WorkspaceEdit();
            action.edit.replace(document.uri, range, accumulated);

            return [action];
            
        } catch (error) {
            console.error("Error generating refactor code, ", error);
        }
    }


    cleanResponse(text: string): string {
        return text
            .replace(/```[a-zA-Z]*\n?/g, "")
            .replace(/```/g, "")
            .trim();
    }
}