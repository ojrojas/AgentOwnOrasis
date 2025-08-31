import {
    CancellationToken,
    InlineCompletionContext,
    InlineCompletionItem,
    InlineCompletionItemProvider,
    InlineCompletionList,
    Position,
    ProviderResult,
    Range,
    TextDocument,
    window,
    workspace,
} from 'vscode';
import { IOllamaApiService } from '../../core/interfaces/ollama.interface.service';

export class CompletionProvider implements InlineCompletionItemProvider {

    constructor(private ollamaService: IOllamaApiService) {
    }

    async provideInlineCompletionItems(
        document: TextDocument,
        position: Position,
        context: InlineCompletionContext,
        token: CancellationToken
    ): Promise<InlineCompletionList | null | undefined> {
        const settings = workspace.getConfiguration('oroasisSettings');
        const roleAgent = settings.get<string>('templatePromptAutoComplete');
        const model = settings.get<string>('modelCompletionDefault');
        const languageId = document.languageId;


        if (token.isCancellationRequested) {
            return null;
        }

        const result: InlineCompletionList = {
            items: [],
        };

        if (document.uri.scheme === "vscode-scm") {
            return null;
        }

        const editor = window.activeTextEditor;
        if (!editor || editor.selections.length > 1) {
            return null;
        }

        if (position.line <= 0) {
            return null;
        }

        const startLine = Math.max(0, position.line - 10);
        const codeContext = document.getText(new Range(startLine, 0, position.line, position.character));

        const request = `${roleAgent}, only return valid ${languageId} code. Here is the context:${codeContext} Continue from here:`;

        try {
            const response = await this.ollamaService.generate({
                model: model as string,
                prompt: request,
                options: { temperature: 0.2, top_p: 0.9, num_predict: 100, }
            });
            let accumulated = '';
            for await (const chunk of response) {
                console.info(chunk);
                accumulated += chunk.response;
            }

            if (token.isCancellationRequested) {
                return null;
            }

            accumulated = this.cleanResponse(accumulated).trim();

            result.items.push(
                {
                    insertText: accumulated,
                    range: new Range(position.line, position.character, position.line, position.character)
                }
            );

            return result;

        } catch (error) {
            console.error("CompletionProvider error:", error);
            return null;
        }
    }

    cleanResponse(text: string): string {
        return text
            .replace(/```[a-zA-Z]*\n?/g, "")
            .replace(/```/g, "")
            .trim();
    }
}
