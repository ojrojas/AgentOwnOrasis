import { ChatRequest, ChatResponse, GenerateRequest, GenerateResponse, ListResponse, Message, Ollama } from 'ollama';
import { workspace } from 'vscode';

export class OllamaApiService {
    readonly ollama: Ollama;
    templateGenerate: string | undefined;
    messages: Message[] = [];
    constructor() {
        const settings = workspace.getConfiguration("oroasisSettings");
        this.templateGenerate = settings.get('templatePromptGenerate');
        this.ollama = new Ollama({ host: settings.get('ollamaBaseUrl') });
        const hasModels = settings.get('ollamaListModels') as Array<ListResponse>;
        if (hasModels.length === 0) {
            const response = this.listModels();
            response.then(list => {
                if (list.models.length > 0) {
                    settings.update("ollamaListModels",list.models, true);
                }
            });
        }
    }

    listModels = () => {
        return this.ollama.list();
    };

    generate = (request: GenerateRequest): Promise<GenerateResponse> => {
        return this.ollama.generate({
            model: request.model,
            prompt: request.prompt,
            template: this.templateGenerate
        });
    };

    chat = (request: ChatRequest): Promise<ChatResponse> => {
        this.addMessages(request.messages!);
        return this.ollama.chat({
            model: request.model,
            messages: this.messages
        });
    };

    public addMessages = (messages: Message[]): void => {
        this.messages.push(messages[0]);
    };

}