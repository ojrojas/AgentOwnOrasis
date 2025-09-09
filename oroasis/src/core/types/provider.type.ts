export type IProviderConfig = {
  id: string;
  // type: 'ollama' | 'openai' | 'anthropic' | 'google';
  baseUrl?: string;
  apiKey?: string;
  version?: string;
  extraOptions?: Record<string, any>;
};

export type ProvidersMap = Record<string, IProviderConfig>;