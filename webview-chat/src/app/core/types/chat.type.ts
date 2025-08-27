import { IMessage } from "./message.type";

export interface IChat {
    id: string;
    messages: IMessage[];
    context?: number[];
}