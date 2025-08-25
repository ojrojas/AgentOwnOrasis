import { AbortableAsyncIterator, ChatRequest, ChatResponse, GenerateRequest, GenerateResponse, ListResponse, Message, Ollama } from 'ollama';
import { workspace, WorkspaceConfiguration } from 'vscode';
import { IOllamaApiService } from '../interfaces/ollama.interface.service';

export class OllamaApiService implements IOllamaApiService {
    readonly ollama: Ollama;
    templateGenerate: string | undefined;
    settings: WorkspaceConfiguration;
    constructor() {
        this.settings = workspace.getConfiguration("oroasisSettings");
        this.ollama = new Ollama({ host: this.settings.get('ollamaBaseUrl') });
    }
    pullModel =  (nameModel: string) => {
        this.ollama.pull({
            model: nameModel
        });
    };

    listModels = (): Promise<ListResponse> => {
        return this.ollama.list();
    };

    generate = (request: GenerateRequest): Promise<AbortableAsyncIterator<GenerateResponse>> => {
        return this.ollama.generate({
            model: request.model,
            prompt: request.prompt,
            template: request.template,
            options: request.options,
            context: request.context,
            format: request.format,
            system: request.system,
            stream: true,
            images: request.images,
            keep_alive: request.keep_alive,
            raw: request.raw,
            suffix: request.suffix
        });
    };

    chat = (request: ChatRequest): Promise<AbortableAsyncIterator<ChatResponse>> => {
        return this.ollama.chat({
            model: request.model,
            messages: request.messages,
            options: request.options,
            format: request.format,
            keep_alive: request.keep_alive,
            tools: request.tools,
            stream: true
        });
    };

    public udpdateListModels = (): void => {
        const response = this.listModels();
        response.then(list => {
            if (list.models.length > 0) {
                this.settings.update("ollamaListModels", list.models, true);
            }
        });
    };
}