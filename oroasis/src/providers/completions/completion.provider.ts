import {
    CancellationToken,
    InlineCompletionContext,
    InlineCompletionItemProvider,
    InlineCompletionList,
    Position,
    Range,
    TextDocument,
    window,
    workspace,
} from 'vscode';
import { IGenerateRequest } from '../../core/types/chat-message.type';
import { ProvidersMap } from '../../core/types/provider.type';
import { IProviderFactory } from '../../core/services/provider.factory.service';

export class CompletionProvider implements InlineCompletionItemProvider {

    constructor(private providersMap: ProvidersMap) { }

    async provideInlineCompletionItems(
        document: TextDocument,
        position: Position,
        context: InlineCompletionContext,
        token: CancellationToken
    ): Promise<InlineCompletionList | null> {

        const settings = workspace.getConfiguration('oroasisSettings');
        const roleAgent = settings.get<string>('templatePromptAutoComplete') || '';
        const model = settings.get<string>('modelCompletionDefault');
        const providerName = settings.get<string>('providerDefault') || 'ollama';
        const languageId = document.languageId;

        if (!model || token.isCancellationRequested) { return null; }
        if (document.uri.scheme === "vscode-scm") { return null; }

        const editor = window.activeTextEditor;
        if (!editor || editor.selections.length > 1) { return null; }
        if (position.line <= 0) { return null; }

        const startLine = Math.max(0, position.line - 10);
        const codeContext = document.getText(new Range(startLine, 0, position.line, position.character));
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

            return {
                items: [{
                    insertText: accumulated,
                    range: new Range(position.line, position.character, position.line, position.character)
                }]
            };

        } catch (error) {
            console.error("CompletionProvider error:", error);
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
