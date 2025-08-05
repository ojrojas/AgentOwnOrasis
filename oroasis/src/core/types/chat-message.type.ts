import { ChatRequest, Message } from "ollama";

export interface IChatMessage extends Message {
    id: string;
}