import { IChatMessage, IChatRequest, IGenerateRequest, IMessage, IModelList } from "../types/chat-message.type";

export interface IProviderApiService {
  listModels: () => Promise<IModelList>;
  generate: (request: IGenerateRequest) => Promise<IMessage>;
  chat: (request: IChatRequest) => Promise<IChatMessage>;

  generateStream?(request: IGenerateRequest): AsyncGenerator<IMessage>;
  chatStream?(request: IChatRequest): AsyncGenerator<IMessage>;

  pullModel?: (nameModel: string) => void;
}
