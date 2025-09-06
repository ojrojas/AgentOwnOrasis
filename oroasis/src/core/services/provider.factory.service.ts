import { OllamaAdapter } from "../adapters/ollama.adapters";
import { OpenAIAdapter } from "../adapters/openai.adapter";
import { IProviderApiService } from "../interfaces/provider.interface.service";
import { ProvidersMap } from "../types/provider.type";

export class IProviderFactory {
  private adapters: Record<string, IProviderApiService> = {};

  constructor(private providers: ProvidersMap){
    for(const [name, config] of Object.entries(providers)){
      switch(config.type){
        case 'ollama':
          this.adapters[name] = new OllamaAdapter(config); break;
        case 'openai':
          this.adapters[name] = new OpenAIAdapter(config); break;
          // case anthropic, google
        default:
          throw new Error(`no support provider: ${config.type}`);
      }
    }
  }

  getAdapter(name:string): IProviderApiService {
    const adapter = this.adapters[name];
    if(!adapter) {
        throw new Error(`do no exist provider: ${name}`);
    }
    return adapter;
  }
}
