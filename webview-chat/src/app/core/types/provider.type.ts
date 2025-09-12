export type IProviderConfig = {
  id: string;
  baseUrl?: string;
  apiKey?: string;
  version?: string;
  extraOptions?: Record<string, any>;
};
