import { ChatRequest, ChatResponse, GenerateRequest, GenerateResponse, ListResponse, Message } from "ollama";

export interface IOllamaApiService {
    listModels: () => Promise<ListResponse>;
    generate: (request: GenerateRequest) => Promise<GenerateResponse>;
    chat: (request: ChatRequest) => Promise<ChatResponse>;
    udpdateModels: () => void;
}