import {
    CancellationToken,
    CodeAction,
    CodeActionContext,
    CodeActionKind,
    CodeActionProvider,
    Range,
    Selection,
    TextDocument,
    window,
    workspace,
    WorkspaceEdit,
    OutputChannel
} from 'vscode';
import { IGenerateRequest } from '../../core/types/chat-message.type';
import { ProvidersMap } from '../../core/types/provider.type';
import { IProviderFactory } from '../../core/services/provider.factory.service';

export class RefactorProvider implements CodeActionProvider {

    constructor(private providersMap: ProvidersMap, private outputChannel: OutputChannel) { }

    async provideCodeActions(
        document: TextDocument,
        range: Range | Selection,
        context: CodeActionContext,
        token: CancellationToken
    ): Promise<(CodeAction)[] | null> {

        const settings = workspace.getConfiguration('oroasisSettings');
        const roleAgent = settings.get<string>('templatePromptRefactor');
        const model = settings.get<string>('modelDefault');
        const providerName = settings.get<string>('providerDefault') || 'ollama';
        const languageId = document.languageId;

        if (!roleAgent || !model) {
            this.outputChannel.appendLine("There are no saved settings for Oroasis extension -> extensions -> oroasis settings");
            return null;
        }
        if (token.isCancellationRequested) { return null; }
        if (document.uri.scheme === "vscode-scm") { return null; }

        const editor = window.activeTextEditor;
        if (!editor || editor.selections.length > 1) { return null; }

        const codeContext = document.getText(range).trim();
        if (codeContext.length <= 0) { return null; }

        const prompt = `${roleAgent}. Here is the context:${codeContext}, only return valid ${languageId} code`;

        try {
            const factory = new IProviderFactory(this.providersMap);
            const adapter = factory.getAdapter(providerName);

            const request: IGenerateRequest = {
                model,
                prompt,
                options: { temperature: 0.0, top_p: 0.95, repeat_penalty: 1.5, num_predict: 140 }
            };

            let accumulated = '';

            if (adapter.generateStream) {
                const stream = adapter.generateStream(request);
                for await (const chunk of stream) {
                    if (token.isCancellationRequested) { return null; }
                    accumulated += chunk.content;
                }
            } else {
                const result = await adapter.generate(request);
                accumulated = result.content;
            }

            if (token.isCancellationRequested) { return null; }

            accumulated = this.cleanResponse(accumulated);

            const action = new CodeAction("AI: Improve code from Oroasis", CodeActionKind.QuickFix);
            action.edit = new WorkspaceEdit();
            action.edit.replace(document.uri, range, accumulated);

            return [action];

        } catch (error) {
            console.error("Error generating refactor code:", error);
            return null;
        }
    }

    private cleanResponse(text: string): string {
        return text
            .replace(/```[a-zA-Z]*\n?/g, "")
            .replace(/```/g, "")
            .trim();
    }
}
