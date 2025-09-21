import { ProvidersMap } from "../core/types/provider.type";

export const providers: ProvidersMap = {
  ollama: {
    id: 'ollama',
    isSelected: false,
    baseUrl: 'http://localhost:11434',
    version: '',
    apiKey: '',
    refactorModel: '',
    completionModel: '',
    extraOptions: {
      temperature: .3,
    }
  },
  openai: {
    id: 'openai',
    isSelected: false,
    baseUrl: 'https://api.openai.com',
    apiKey: process.env.OPENAI_API_KEY,
    version: 'v1',
    refactorModel: '',
    completionModel: '',
    extraOptions: {
      temperature: .3,
    }
  },
  // anthropic: {
  //   id: 'anthropic',
  //   isSelected: false,
  //   baseUrl: 'https://api.anthropic.com',
  //   apiKey: process.env.ANTHROPIC_API_KEY,
  //   version: 'v1',
  // refactorModel: '',
  // completionModel: '',
  //   extraOptions: {
  //      temperature: .3,
  //   }
  // },
  // google: {
  //   id: 'google',
  //   isSelected: false,
  //   baseUrl: 'https://generativelanguage.googleapis.com',
  //   apiKey: process.env.GOOGLE_API_KEY,
  //   version: 'v1',
  // refactorModel: '',
  // completionModel: '',
  //   extraOptions: {
  //     temperature: .3,
  //   }
  // }
};