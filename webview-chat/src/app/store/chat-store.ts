import { getState, patchState, signalState, signalStore, withComputed, withHooks, withMethods, withState } from "@ngrx/signals";
import { IMessage } from "../core/types/message.type";
import { IListModelsResponse } from "../core/types/models.types";
import { setFulfilled, setPending, withRequestStatus } from "./request.status";
import { withLogger } from "./logger.state";
import { computed, inject } from "@angular/core";
import { VscodeService } from "../core/services/vscode-service";
import { IChat } from "../core/types/chat.type";

type ChatState = {
  isLoading: boolean;
  error: string | undefined;
  models: IListModelsResponse | undefined;
  preferredModel: string | undefined;
  files: string[];
  typeMessage: 'Ask' | 'Edit' | 'Agent'
  currentModel: string | undefined;
  listChat: IChat[];
  selectedChatId: string | null;
}

const initialState: ChatState = {
  error: undefined,
  isLoading: false,
  models: undefined,
  preferredModel: undefined,
  files: [],
  typeMessage: 'Ask',
  currentModel: undefined,
  selectedChatId: null,
  listChat: []
};

const chatState = signalState<ChatState>(initialState);

export const ChatStore = signalStore(
  { providedIn: 'root' },
  withState(chatState),
  withRequestStatus(),
  withLogger("Oroasis"),
  withComputed((state) => ({
    hasResponse: computed(() => state.isLoading),

    currentMessages: computed(() => {
      const chats = state.listChat();
      const selectedId = state.selectedChatId();
      const chat = chats.find(c => c.id === selectedId);
      return chat?.messages ?? [];
    }),

    currentContext: computed(() => {
      const chats = state.listChat();
      const selectedId = state.selectedChatId();
      const chat = chats.find(c => c.id === selectedId);
      return chat?.context ?? [];
    })
  })),
  withMethods((store, vscodeService = inject(VscodeService)) => ({
    postMessage(message: IMessage) {
      patchState(store, setPending());
      const { preferredModel } = getState(store);

      patchState(store, state =>
        this.updateSelectedChat(state, chat => ({
          ...chat,
          messages: [...chat.messages, message],
        }))
        , setFulfilled());

      return {
        ...message,
        model: message.model,
        type: message.type !== 'Agent' ? 'generated' : 'chat',
      };
    },

    sendChat(message: IMessage) {
      patchState(store, setPending());
      const chatId = store.selectedChatId();
      if (!chatId) { return; };

      const state = getState(store);
      const chat = this.getSelectedChat(state);
      const context = chat?.context;

      const payload = {
        ...message,
        chatId,
        context,
        messages: [...(chat?.messages ?? []), message].map(m => ({
          role: m.role,
          content: m.content
        }))
      };
      vscodeService.sendMessage('sendChat', payload);

      let comePartialResponse = false;

      vscodeService.onMessage<IMessage>('sendChat:response', (partialResponse) => {
        patchState(store, state =>
          this.updateSelectedChat(state, chat => {
            const lastMsgIndex = chat.messages.findIndex(m => m.role === 'assistant' && !m.done);
            if (lastMsgIndex !== -1) {
              const updated = [...chat.messages];
              updated[lastMsgIndex] = { ...updated[lastMsgIndex], ...partialResponse };
              return {
                ...chat,
                messages: updated,
                context: partialResponse.context ?? chat.context
              };
            }
            if (!comePartialResponse) {
              comePartialResponse = true;
              return {
                ...chat,
                messages: [...chat.messages, partialResponse],
                context: partialResponse.context
              };
            }
            return chat;
          })
        );
      });

      vscodeService.onMessage('sendChat:response:done', () => {
        patchState(store, setFulfilled());
      });
    },

    getSelectedChat(state: ChatState): IChat | undefined {
      return state.listChat.find(c => c.id === state.selectedChatId);
    },

    loadAllMessages() {

    },

    loadMessages(chatId: string) {

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

    updateSelectedChat(state: ChatState, updater: (chat: IChat) => IChat): ChatState {
      return {
        ...state,
        listChat: state.listChat.map(c =>
          c.id === state.selectedChatId ? updater(c) : c
        ),
      };
    },

    backToChatList() {
      debugger;
      patchState(store, { selectedChatId: null });
    },

    async loadModels() {
      patchState(store, setPending());
      const response = await vscodeService.request<IListModelsResponse>("getModels");
      patchState(store, { models: response }, setFulfilled());
    },

    async getPreferredModel() {
      patchState(store, setPending());
      const response = await vscodeService.request<string>("getPreferredModel");
      patchState(store, { preferredModel: response }, setFulfilled());
    },

    async loadWorkSpaceFolders() {
      patchState(store, setPending());
      const response = await vscodeService.request<string[]>("listFiles");
      patchState(store, { files: response }, setFulfilled());
    },

    extractMentions(text: string): string[] {
      const regex = /@(\S+)/g;
      const mentions: string[] = [];
      let match;
      while ((match = regex.exec(text)) !== null) {
        mentions.push(match[1]);
      }
      return mentions;
    },

    resolveMentions(text: string): string[] {
      const mentions = this.extractMentions(text);
      const allFiles = store.files;
      const resolved = mentions
        .map(m => allFiles().find(f => f.endsWith(m)))
        .filter((f): f is string => !!f);

      return Array.from(new Set(resolved));
    },

    clearState() {
      patchState(store, initialState, setFulfilled());
    }
  })),
  // withHooks(() => ({}))
);
