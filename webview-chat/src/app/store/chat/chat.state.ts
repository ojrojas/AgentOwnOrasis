import { MessageType } from "../../core/enums/type-message.enum";
import { IChat } from "../../core/types/chat.type";
import { IListModelsResponse } from "../../core/types/models.types";

export type ChatState = {
  isLoading: boolean;
  error: string | undefined;
  providers: string[] | undefined;
  models: IListModelsResponse | undefined;
  preferredModel: string | undefined;
  files: string[];
  typeMessage: MessageType.Ask | MessageType.Agent;
  currentModel: string | undefined;
  listChat: IChat[];
  selectedChatId: string | null;
};

export const initialStateStore: ChatState = {
  error: undefined,
  isLoading: false,
  models: undefined,
  providers: undefined,
  preferredModel: undefined,
  files: [],
  typeMessage: MessageType.Ask,
  currentModel: undefined,
  selectedChatId: null,
  listChat: []
};
