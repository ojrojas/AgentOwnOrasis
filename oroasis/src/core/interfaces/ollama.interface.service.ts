import { AbortableAsyncIterator, ChatRequest, ChatResponse, GenerateRequest, GenerateResponse, ListResponse } from "ollama";

export interface IOllamaApiService {
    listModels: () => Promise<ListResponse>;
    generate: (request: GenerateRequest) => Promise<AbortableAsyncIterator<GenerateResponse>>;
    chat: (request: ChatRequest) => Promise<AbortableAsyncIterator<ChatResponse>>;
    udpdateListModels: () => void;
    pullModel : (nameModel:string) => void;
}