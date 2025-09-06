import { ProvidersMap } from "../core/types/provider.type";

export const providers: ProvidersMap = {
  ollama: {
    type: 'ollama',
    baseUrl: 'http://localhost:11434',
    version: 'v1',
    apiKey: '',
  },
  openai: {
    type: 'openai',
    baseUrl: 'https://api.openai.com',
    apiKey: process.env.OPENAI_API_KEY,
    version: 'v1',
  },
  // anthropic: {
  //   type: 'anthropic',
  //   baseUrl: 'https://api.anthropic.com',
  //   apiKey: process.env.ANTHROPIC_API_KEY,
  //   version: 'v1',
  // },
  // google: {
  //   type: 'google',
  //   baseUrl: 'https://generativelanguage.googleapis.com',
  //   apiKey: process.env.GOOGLE_API_KEY,
  //   version: 'v1',
  // }
};