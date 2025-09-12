import { ProvidersMap } from "../core/types/provider.type";

export const providers: ProvidersMap = {
  ollama: {
    id: 'ollama',
    baseUrl: 'http://localhost:11434',
    version: '',
    apiKey: '',
    listModels: [],
    extraOptions: {
      preferredModel: '',
    }
  },
  openai: {
    id: 'openai',
    baseUrl: 'https://api.openai.com',
    apiKey: process.env.OPENAI_API_KEY,
    version: 'v1',
    listModels: [],
    extraOptions: {
      preferredModel: '',
    }
  },
  // anthropic: {
  //   id: 'anthropic',
  //   baseUrl: 'https://api.anthropic.com',
  //   apiKey: process.env.ANTHROPIC_API_KEY,
  //   version: 'v1',
  // listModels: [],
  //   extraOptions: {
  //     preferredModel: '',
  //   }
  // },
  // google: {
  //   id: 'google',
  //   baseUrl: 'https://generativelanguage.googleapis.com',
  //   apiKey: process.env.GOOGLE_API_KEY,
  //   version: 'v1',
  // listModels: [],
  //   extraOptions: {
  //     preferredModel: '',
  //   }
  // }
};