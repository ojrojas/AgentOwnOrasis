import {
    CancellationToken,
    InlineCompletionContext,
    InlineCompletionItemProvider,
    InlineCompletionList,
    Position,
    Range,
    SnippetString,
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
    ): Promise<InlineCompletionList | null> {
        const settings = workspace.getConfiguration('oroasisSettings');
        const roleAgent = settings.get<string>('templatePromptAutoComplete');
        const model = settings.get<string>('modelCompletionDefault');
        const languageId = document.languageId;


     
			// console.log('provideInlineCompletionItems triggered');
			// const regexp = /\/\/ \[(.+?),(.+?)\)(.*?):(.*)/;
			// if (position.line <= 0) {
			// 	return;
			// }

			// const result: vscode.InlineCompletionList = {
			// 	items: [],
			// 	commands: [],
			// };

			// let offset = 1;
			// while (offset > 0) {
			// 	if (position.line - offset < 0) {
			// 		break;
			// 	}

			// 	const lineBefore = document.lineAt(position.line - offset).text;
			// 	const matches = lineBefore.match(regexp);
			// 	if (!matches) {
			// 		break;
			// 	}
			// 	offset++;

			// 	const start = matches[1];
			// 	const startInt = parseInt(start, 10);
			// 	const end = matches[2];
			// 	const endInt =
			// 		end === '*'
			// 			? document.lineAt(position.line).text.length
			// 			: parseInt(end, 10);
			// 	const flags = matches[3];
			// 	const completeBracketPairs = flags.includes('b');
			// 	const isSnippet = flags.includes('s');
			// 	const text = matches[4].replace(/\\n/g, '\n');

			// 	result.items.push({
			// 		insertText: isSnippet ? new vscode.SnippetString(text) : text,
			// 		range: new Range(position.line, startInt, position.line, endInt),
			// 		completeBracketPairs,
			// 	});
			// }

			// if (result.items.length > 0) {
			// 	result.commands!.push({
			// 		command: 'demo-ext.command1',
			// 		title: 'My Inline Completion Demo Command',
			// 		arguments: [1, 2],
			// 	});
			// }
			// return result;




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

        const result: InlineCompletionList = { items: [] };

        const lineBefore = document.lineAt(position.line - 1).text;
        const request = `You are an AI code completion engine. 
Continue writing the following code in ${languageId}. 
Do not explain, do not add comments, only return valid ${languageId} code. 
Here is the context:

${lineBefore}

Continue from here:`;

        try {

            const response = await this.ollamaService.generate({
                model: model as string,
                prompt: request,
                options: { temperature: 0.0 }
            });
            let accumulated = '';
            for await (const chunk of response) {
                console.log(chunk);
                accumulated += chunk;
            }

            return {
                items: [
                    {
                        insertText: new SnippetString(accumulated),
                        range: new Range(position.line, 0, position.line, 0)
                    }
                ]
            };
        } catch (error) {
            console.error("CompletionProvider error:", error);
            return null;
        }
    }
}
