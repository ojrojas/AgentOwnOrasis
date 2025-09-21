import { buildProviderUrl } from '../../shared/utils/builderParams.utils';
import { IProviderApiService } from '../interfaces/provider.interface.service';
import { HttpService } from '../services/http.service';
import { IChatMessage, IChatRequest, IGenerateMessage, IGenerateRequest, IMessage, IModelInfo, IModelList } from '../types/chat-message.type';
import { IProviderConfig } from '../types/provider.type';

function extractContextLength(modelInfo: any): number | null {
  if (!modelInfo || !modelInfo["model_info"]) { return null; }

  const info = modelInfo["model_info"];
  for (const key of Object.keys(info)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes("context_length") || lowerKey.includes("context_lenght")) {
      return Number(info[key]);
    }
  }

  return null;
}

export class OllamaAdapter implements IProviderApiService {
  private http = new HttpService();
  constructor(private config: IProviderConfig) { }

  async listModels(): Promise<IModelList> {
    const url = buildProviderUrl(this.config, '/api/tags');
    return await this.http.get<IModelList>(url);
  }

  async generate(req: IGenerateRequest): Promise<IGenerateMessage> {
    const url = buildProviderUrl(this.config, '/api/generate');
    const data = await this.http.post<IGenerateRequest, any>(url, req);
    return { id: data.id || crypto.randomUUID(), role: 'assistant', content: data.text || '', timestamp: new Date(), model: req.model };
  }

  async chat(req: IChatRequest): Promise<IChatMessage> {
    const url = buildProviderUrl(this.config, '/api/chat');
    const data = await this.http.post<IChatRequest, any>(url, req);
    return { id: data.id || crypto.randomUUID(), messages: (data.messages || []).map((m: any) => ({ id: m.id || crypto.randomUUID(), role: m.role, content: m.content, timestamp: new Date(m.timestamp || Date.now()), model: req.model, tool_calls: m.tool_calls, images: m.images })) };
  }

  async *generateStream(req: IGenerateRequest): AsyncGenerator<IGenerateMessage> {
    const url = buildProviderUrl(this.config, '/api/generate');
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...req, stream: true }) });
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
      let parts = buffer.split('\n');
      buffer = parts.pop()!;
      for (const part of parts) {
        if (!part.trim()) {
          continue;
        }

        const data = JSON.parse(part);
        yield { id: data.id || crypto.randomUUID(), role: data.role || 'assistant', content: data.response || '', timestamp: new Date(), model: data.model, done: data.done, context: data.context };
      }
    }

    if (buffer.trim()) {
      const data = JSON.parse(buffer);
      yield { id: data.id || crypto.randomUUID(), role: data.role || 'assistant', content: data.response || '', timestamp: new Date(), model: data.model, done: data, context: data.context };
    }
  }

  async *chatStream(req: IChatRequest): AsyncGenerator<IMessage> {
    const url = buildProviderUrl(this.config, 'chat');
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...req, stream: true }) });
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
      let parts = buffer.split('\n');
      buffer = parts.pop()!;
      for (const part of parts) {
        if (!part.trim()) {
          continue;
        }
        const data = JSON.parse(part);
        yield { id: data.id || crypto.randomUUID(), role: data.role || 'assistant', content: data.content || '', timestamp: new Date(), model: data.model, tool_calls: data.tool_calls, images: data.images, done: data.done };
      }
    }
    if (buffer.trim()) {
      const data = JSON.parse(buffer);
      yield { id: data.id || crypto.randomUUID(), role: data.role || 'assistant', content: data.content || '', timestamp: new Date(), model: data.model, tool_calls: data.tool_calls, images: data.images, done: data.done };
    }
  }

  async pullModel(modelName: string) {
    const url = buildProviderUrl(this.config, 'pull');
    await this.http.post<{ model: string }, any>(url, { model: modelName });
  }

  async show(modelName: string): Promise<IModelInfo> {
    const url = buildProviderUrl(this.config, '/api/show');
    const result = await this.http.post<{ model: string }, IModelInfo>(url, { model: modelName });
    return {
      model_info: {
        'ctx_number': extractContextLength(result),
      }, capabilities: result.capabilities
    };

  }
}