import { IOllamaApiService } from '../interfaces/ollama.interface.service';
import { AbortableAsyncIterator, ChatRequest, ChatResponse, GenerateRequest, GenerateResponse, ListResponse } from 'ollama';

export class ChatController {
    constructor(private ollamaApiService: IOllamaApiService) { }

    async listModels(): Promise<ListResponse> {
        return await this.ollamaApiService.listModels();
    }
    async generate(request: GenerateRequest): Promise<AbortableAsyncIterator<GenerateResponse>> {
        return await this.ollamaApiService.generate(request);
    }
    async chat(request: ChatRequest): Promise<AbortableAsyncIterator<ChatResponse>> {
        return await this.ollamaApiService.chat(request);
    }
    udpdateListModels(): void {
        this.ollamaApiService.udpdateListModels();
    }

    pullModel(nameModel: string): void {
        this.ollamaApiService.pullModel(nameModel);
    }
}
