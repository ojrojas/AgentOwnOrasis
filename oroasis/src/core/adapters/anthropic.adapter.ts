import { IProviderApiService } from "../interfaces/provider.interface.service";
import { HttpService } from "../services/http.service";
import { IGenerateRequest, IGenerateMessage, IChatRequest, IChatMessage, IMessage, IModelList } from "../types/chat-message.type";
import { IProviderConfig } from "../types/provider.type";

export class AnthropicAdapter implements IProviderApiService {
    private http = new HttpService();
    constructor(private config: IProviderConfig) { }

    private headers() { return { 'X-API-Key': this.config.apiKey!, 'Content-Type': 'application/json' }; }

    async listModels(): Promise<IModelList> {
        return await this.http.get<IModelList>(`${this.config.baseUrl}/v1/models`, this.headers());
    }

    async generate(req: IGenerateRequest): Promise<IGenerateMessage> {
        const data = await this.http.post<IGenerateRequest, any>(`${this.config.baseUrl}/v1/complete`, req, this.headers());
        return { id: data.id || crypto.randomUUID(), role: 'assistant', content: data.completion || '', timestamp: new Date(), model: req.model };
    }

    async chat(req: IChatRequest): Promise<IChatMessage> {
        const data = await this.http.post<IChatRequest, any>(`${this.config.baseUrl}/v1/chat/completions`, req, this.headers());
        return {
            id: data.id || crypto.randomUUID(),
            messages: (data.choices || []).map((c: any) => ({
                id: c.id || crypto.randomUUID(),
                role: 'assistant',
                content: c.message?.content || '',
                timestamp: new Date(),
                model: req.model,
                tool_calls: c.message?.tool_calls,
                images: c.message?.images
            }))
        };
    }

    async *chatStream(req: IChatRequest): AsyncGenerator<IMessage> {
        const res = await fetch(`${this.config.baseUrl}/v1/chat/completions?stream=true`, {
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify(req)
        });

        if (!res.body) {
            return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop()!;
            for (const line of lines) {
                if (!line.trim()) {
                    continue;
                }

                const data = JSON.parse(line);
                yield { id: data.id || crypto.randomUUID(), role: 'assistant', content: data.text || '', timestamp: new Date(), model: req.model, done: false };
            }
        }
        if (buffer.trim()) {
            const data = JSON.parse(buffer);
            yield { id: data.id || crypto.randomUUID(), role: 'assistant', content: data.text || '', timestamp: new Date(), model: req.model, done: true };
        }
    }
}
