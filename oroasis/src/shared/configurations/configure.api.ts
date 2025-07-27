export type ApiProvider = "ollama";

export interface ApiConfiguration {
    apiProviver: string | undefined;
    favoriteModels: string[] | undefined;
}
