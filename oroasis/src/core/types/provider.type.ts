export type IProviderConfig = {
  id: string;
  isSelected: boolean;
  baseUrl?: string;
  apiKey?: string;
  version?: string;
  refactorModel?: string;
  completionModel?: string;
  extraOptions?: Record<string, any>;
};

export type ProvidersMap = Record<string, IProviderConfig>;