import { IChat } from "../../core/types/chat.type";
import { IListModelsResponse } from "../../core/types/models.types";

export type ChatState = {
  isLoading: boolean;
  error: string | undefined;
  providers: string[] | undefined;
  models: IListModelsResponse | undefined;
  preferredModel: string | undefined;
  files: string[];
  typeMessage: 'Ask' | 'Edit' | 'Agent';
  currentModel: string | undefined;
  listChat: IChat[];
  selectedChatId: string | null;
};

export const initialState: ChatState = {
  error: undefined,
  isLoading: false,
  models: undefined,
  providers: undefined,
  preferredModel: undefined,
  files: [],
  typeMessage: 'Ask',
  currentModel: undefined,
  selectedChatId: null,
  listChat: []
};
