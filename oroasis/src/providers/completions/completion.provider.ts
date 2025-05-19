import {
    CancellationToken,
    InlineCompletionContext,
    InlineCompletionItem,
    InlineCompletionItemProvider,
    InlineCompletionList,
    Position,
    ProviderResult,
    Range,
    SnippetString,
    TextDocument,
    window,
    workspace
} from 'vscode';
import { IOllamaApiService } from '../../core/services/ollama.interface.service';

export class CompletionProvider implements InlineCompletionItemProvider {

    constructor(private ollamaService: IOllamaApiService) {
    }
    provideInlineCompletionItems(document: TextDocument, position: Position, context: InlineCompletionContext, token: CancellationToken): ProviderResult<InlineCompletionItem[] | InlineCompletionList> {
        const settings = workspace.getConfiguration('oroasisSettings');
        const roleAgent = settings.get('templatePromptAutoComplete');
        const model = settings.get('modelCompletionDefault');

        if (document.uri.scheme === "vscode-scm") {
            return null;
        }

        const editor = window.activeTextEditor;
        if (editor && editor.selections.length > 1 || editor === undefined) {
            return null;
        }

        if (position.line <= 0) {
            return;
        }

        const result: InlineCompletionList = {
            items: [],
        };

        const lineBefore = document.lineAt(position.line - 1).text;

        const documentEditor = editor.document;
        const selection = editor.selection;

        // Get the word within the selection
        const word = document.getText(selection);

        let request = roleAgent as string;
        request = request.concat("\n", lineBefore).trim();

        try {
            const response = this.ollamaService.generate({
                model: model as string,
                prompt: request,
                // options: {
                //     temperature: 0.0,
                //    presence_penalty: 1,
                //    top_p: 0.6
                // }
            });
    
            console.log("response", response);
    
            response.then(res => {
                console.log("response generate: ", res);
                result.items.push({
                    insertText: new SnippetString(res.response),
                    range: new Range(position.line, 0, position.line, 0)
                });
            });
            response.catch((error) => {
                console.error(error);
            });
            
        } catch (error) {
            console.log("error", error);    
        }




        // const selectedCompletionInfo = context.selectedCompletionInfo;

        // if (selectedCompletionInfo) {
        //     const { text, range } = selectedCompletionInfo;
        //     const typedText = document.getText(range);

        //     const typedLength = range.end.character - range.start.character;

        //     if (typedLength < 4) {
        //         return null;
        //     }

        //     if (!text.startsWith(typedText)) {
        //         return null;
        //     }
        // }

        // let injectDetails: string | undefined = undefined;

    }
    // provideInlineCompletionItems(document: TextDocument, position: Position, context: InlineCompletionContext, token: CancellationToken): ProviderResult<InlineCompletionItem[] | InlineCompletionList> {
    //     const settings = workspace.getConfiguration('oroasisSettings');
    //     const roleAgent = settings.get('templatePromptAutoComplete');
    //     const model = settings.get('modelDefault');

    //     const editor = window.activeTextEditor!;
    // 
    //     return result;
    // }

    // handleDidShowCompletionItem(_completionItem: InlineCompletionItem): void {
    // 		console.log('handleDidShowCompletionItem');
    // 	};
}
