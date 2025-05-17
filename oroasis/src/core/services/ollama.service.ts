import { ChatRequest, ChatResponse, GenerateRequest, GenerateResponse, ListResponse, Message, Ollama } from 'ollama';
import { workspace, WorkspaceConfiguration } from 'vscode';
import { IOllamaApiService } from './ollama.interface.service';

export class OllamaApiService implements IOllamaApiService {
    readonly ollama: Ollama;
    templateGenerate: string | undefined;
    messages: Message[] = [];
    settings: WorkspaceConfiguration;
    constructor() {
        this.settings = workspace.getConfiguration("oroasisSettings");
        this.templateGenerate = this.settings.get('templatePromptGenerate');
        this.ollama = new Ollama({ host: this.settings.get('ollamaBaseUrl') });
    }

    listModels = (): Promise<ListResponse> => {
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

    private addMessages = (messages: Message[]): void => {
        this.messages.push(messages[0]);
    };

    public udpdateModels = (): void => {
        const response = this.listModels();
        response.then(list => {
            if (list.models.length > 0) {
                this.settings.update("ollamaListModels", list.models, true);
            }
        });
    };
}