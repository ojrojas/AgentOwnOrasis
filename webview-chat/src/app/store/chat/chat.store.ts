import { getState, patchState, signalState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { computed, inject } from "@angular/core";
import { ChatState, initialStateStore } from "./chat.state";
import { VscodeService } from "../../core/services/vscode-service";
import { extractMentions, updateChatById } from "./chat.helpers";
import { IChat } from "../../core/types/chat.type";
import { withLogger } from "../logger.state";
import { IMessage } from "../../core/types/message.type";
import { IListModelsResponse, IModelInfo } from "../../core/types/models.types";
import { setFulfilled, setPending, withRequestStatus } from "../request.status";

const chatState = signalState<ChatState>(initialStateStore);

export const ChatStore = signalStore(
  { providedIn: 'root' },
  withState(chatState),
  withRequestStatus(),
  withLogger("Oroasis"),
  withComputed((state) => ({
    hasResponse: computed(() => state.isLoading),
    currentMessages: computed(() => {
      const chat = state.listChat().find(c => c.id === state.selectedChatId());
      return chat?.messages ?? [];
    }),
    currentContext: computed(() => {
      const chat = state.listChat().find(c => c.id === state.selectedChatId());
      return chat?.context ?? [];
    })
  })),
  withMethods((store, vscodeService = inject(VscodeService)) => ({
    /** -------------------- Chats -------------------- **/
    createChat(chat: IChat) {
      patchState(store, setPending());
      patchState(store, { listChat: [...store.listChat(), chat] }, setFulfilled());
    },

    clearChats() {
      patchState(store, { listChat: [] }, setFulfilled());
    },

    selectChat(chatId: string) {
      patchState(store, state => {
        const exists = state.listChat.some(c => c.id === chatId);
        return {
          selectedChatId: chatId,
          listChat: exists ? state.listChat : [...state.listChat, { id: chatId, messages: [] }]
        };
      });
    },

    backToChatList() {
      patchState(store, { selectedChatId: null });
    },

    getSelectedChat(state: ChatState): IChat | undefined {
      return state.listChat.find(c => c.id === state.selectedChatId);
    },

    /** -------------------- Messages -------------------- **/
    addMessages(message: IMessage) {
      patchState(store, setPending());
      patchState(store, state =>
        updateChatById(state, message.chatId!, chat => ({
          ...chat,
          messages: [...chat.messages, message],
        })), setFulfilled());
    },

    sendChat(message: IMessage) {
      patchState(store, setPending());
      const chatId = store.selectedChatId();
      if (!chatId) { return; }

      const state = getState(store);
      const chat = this.getSelectedChat(state);
      const context = chat?.context;

      debugger;
      vscodeService.sendMessage('sendChat', {
        ...message,
        chatId,
        context,
      });

      vscodeService.onMessage<IMessage>('sendChat:response', (partialResponse) => {
        patchState(store, state =>
          updateChatById(state, chatId, chat => {
            const idx = chat.messages.findIndex(m => m.id === partialResponse.id);

            if (idx !== -1) {
              const updated = [...chat.messages];
              updated[idx] = { ...updated[idx], ...partialResponse, done: partialResponse.done };
              return { ...chat, messages: updated, context: partialResponse.context ?? chat.context };
            }
            else {
              return { ...chat, messages: [...chat.messages, partialResponse], context: partialResponse.context };
            }
          })
        );
      });
      vscodeService.onMessage('sendChat:response:done', () => patchState(store, setFulfilled()));
    },

    /** -------------------- Data Loading -------------------- **/
    async loadMessages() {
      patchState(store, setPending());
      const chats = await vscodeService.request<IChat[]>('getAllMessages');
      patchState(store, { listChat: chats }, setFulfilled());
    },

    async loadModels() {
      patchState(store, setPending());
      const response = await vscodeService.request<IListModelsResponse>("getModels");
      patchState(store, { models: response }, setFulfilled());
    },

    // async getPreferredModel() {
    //   patchState(store, setPending());
    //   const response = await vscodeService.request<string>("getPreferredModel");
    //   patchState(store, { preferredModel: response }, setFulfilled());
    // },

    async getInfoModel(modelName: string) {
      patchState(store, setPending());
      const response = await vscodeService.request<IModelInfo>("getInfoModel", { model: modelName });
      patchState(store, setFulfilled());
      return response;
    },

    async loadWorkSpaceFolders() {
      patchState(store, setPending());
      const response = await vscodeService.request<string[]>("listFiles");
      console.log("ModelInfo => ", response);
      patchState(store, { files: response }, setFulfilled());
    },

    /** -------------------- Mentions -------------------- **/
    resolveMentions(text: string): string[] {
      const mentions = extractMentions(text);
      return mentions
        .map(m => store.files().find(f => f.endsWith(m)))
        .filter((f): f is string => !!f);
    },

    /** -------------------- Utils -------------------- **/
    clearState() {
      patchState(store, initialStateStore, setFulfilled());
    }
  }))
);
