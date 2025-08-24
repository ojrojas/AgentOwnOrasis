import { patchState, signalState, signalStore, withComputed, withHooks, withMethods, withState } from "@ngrx/signals";
import { IMessage } from "../core/types/message.type";
import { IListModelsResponse } from "../core/types/models.types";
import { setFulfilled, setPending, withRequestStatus } from "./request.status";
import { withLogger } from "./logger.state";
import { computed, effect, inject, isDevMode } from "@angular/core";
import { VscodeService } from "../core/services/vscode-service";

type ChatState = {
  isLoading: boolean;
  error: string | undefined;
  models: IListModelsResponse | undefined;
  messages: IMessage[];
  preferredModel: string | undefined;
  files: string[];
  typeMessage: 'Ask' | 'Edit' | 'Agent'
  context?: number[];
  currentModel: string | undefined;
}

const initialState: ChatState = {
  error: undefined,
  isLoading: false,
  messages: [],
  models: undefined,
  preferredModel: undefined,
  files: [],
  typeMessage: 'Ask',
  context: undefined,
  currentModel: undefined
};

const chatState = signalState<ChatState>(initialState);

export const ChatStore = signalStore(
  { providedIn: 'root' },
  withState(chatState),
  withRequestStatus(),
  withLogger("Oroasis"),
  withComputed((state) => ({
    hasResponse: computed(() => state.isLoading)
  })),
  withMethods((store, vscodeService = inject(VscodeService)) => ({
    postMessage(message: IMessage) {
      patchState(store, setPending());
      const { currentModel, preferredModel, context, messages } = store;
      const modelChanged = currentModel && currentModel !== preferredModel;
      let payload: any;
      if (!modelChanged && context) {
        payload = {
          model: preferredModel,
          prompt: message.content,
          context,
          type: 'generated',
        };
      } else {
        payload = {
          ...message,
          id: message.id,
          model: preferredModel,
          messages: [...messages(), message].map(m => ({
            role: m.role,
            content: m.content
          })),
          type: 'chat'
        };
      }

      patchState(store, (state) => ({
        messages: [...state.messages, message],
        currentModel: preferredModel()
      }), setFulfilled());

      return payload;
    },

    sendChat(message: IMessage) {
      patchState(store, setPending());
      vscodeService.sendMessage('sendChat', message);
      let comePartialResponse = false;
      vscodeService.onMessage<IMessage>('sendChat:response', (partialResponse) => {
        patchState(store, (state) => {
          if (isDevMode()) {
            console.info(state.messages);
          }
          const lastMsgIndex = state.messages.findIndex(m => m.role === 'assistant' && !m.done);
          if (lastMsgIndex !== -1) {
            const updatedMessages = [...state.messages];
            updatedMessages[lastMsgIndex] =
            {
              ...updatedMessages[lastMsgIndex],
              ...partialResponse
            };
            console.log("Update response");
            return { messages: updatedMessages, context: partialResponse.context ?? state.context  };
          }
          console.log("Partial response");
          if (!comePartialResponse) {
            comePartialResponse = true;
            return {
              messages: [...state.messages, partialResponse],
              context: partialResponse.context
            };
          } else {
            return {
              messages: [...state.messages]
            };
          }
        });
      });

      vscodeService.onMessage('sendChat:response:done', () => {
        patchState(store, setFulfilled());
      });
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
