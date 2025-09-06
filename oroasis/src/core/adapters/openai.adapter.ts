import { IProviderApiService } from "../interfaces/provider.interface.service";
import { HttpService } from "../services/http.service";
import { IGenerateRequest, IGenerateMessage, IChatRequest, IChatMessage, IMessage } from "../types/chat-message.type";
import { IProviderConfig } from "../types/provider.type";

export class OpenAIAdapter implements IProviderApiService {
    private http = new HttpService();
    constructor(private config: IProviderConfig) { }
    private headers() { return { Authorization: `Bearer ${this.config.apiKey}`, 'Content-Type': 'application/json' }; }

    pullModel = (nameModel: string) => {

    };


    async listModels(): Promise<{ models: string[] }> {
        return await this.http.get<{ models: string[] }>(`https://api.openai.com/v1/models`, undefined, this.headers());
    }

    async generate(req: IGenerateRequest): Promise<IGenerateMessage> {
        const data = await this.http.post<IGenerateRequest, any>(`https://api.openai.com/v1/completions`, req, this.headers());
        return { id: data.id, role: 'assistant', content: data.choices[0].text, timestamp: new Date(), model: req.model };
    }

    async chat(req: IChatRequest): Promise<IChatMessage> {
        const data = await this.http.post<IChatRequest, any>(`https://api.openai.com/v1/chat/completions`, req, this.headers());
        return { id: data.id, messages: [{ id: crypto.randomUUID(), role: data.choices[0].message.role, content: data.choices[0].message.content, timestamp: new Date(), model: req.model }] };
    }

    async *chatStream(req: IChatRequest): AsyncGenerator<IMessage> {
        const res = await fetch(`https://api.openai.com/v1/chat/completions?stream=true`, {
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify({ model: req.model, messages: req.messages.map(m => ({ role: m.role, content: m.content })) })
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
            const lines = buffer.split('\n').filter(l => l.trim());
            buffer = '';
            for (const line of lines) {
                try {
                    const data = JSON.parse(line.replace(/^data: /, ''));
                    if (data.choices && data.choices[0]?.delta) {
                        yield { id: data.id || crypto.randomUUID(), role: 'assistant', content: data.choices[0].delta.content || '', timestamp: new Date(), model: req.model, done: false };
                    }
                } catch { }
            }
        }
    }
}
