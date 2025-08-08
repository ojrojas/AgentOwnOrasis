import { patchState, signalState, signalStore, withComputed, withHooks, withMethods, withState } from "@ngrx/signals";
import { IMessage } from "../core/types/message.type";
import { IListModelsResponse } from "../core/types/models.types";
import { setFulfilled, setPending, withRequestStatus } from "./request.status";
import { withLogger } from "./logger.state";
import { computed, inject, isDevMode } from "@angular/core";
import { VscodeService } from "../core/services/vscode-service";

type ChatState = {
  isLoading: boolean;
  error: string | undefined;
  models: IListModelsResponse | undefined;
  messages: IMessage[];
  preferredModel: string | undefined;
}

const chatState = signalState<ChatState>({
  error: undefined,
  isLoading: false,
  messages: [],
  models: undefined,
  preferredModel: undefined
});

export const ChatStore = signalStore(
  { providedIn: 'root' },
  withState(chatState),
  withRequestStatus(),
  withLogger("Oroasis"),
  withComputed((state) => ({
    hasResponse: computed(() => state.isLoading)
  })),
  withMethods((store, vscodeService = inject(VscodeService)) => ({
    async postMessage(message: IMessage) {
      patchState(store, setPending());
      patchState(store, (state) => ({
        messages: [...state.messages, message]
      }), setFulfilled());
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
          // Actualiza el último mensaje si ya existe
          const lastMsgIndex = state.messages.findIndex(m => m.role === 'assistant' && !m.done);
          if (lastMsgIndex !== -1) {
            const updatedMessages = [...state.messages];
            updatedMessages[lastMsgIndex] =
            {
              ...updatedMessages[lastMsgIndex],
              ...partialResponse
            };
            console.log("Update response");
            return { messages: updatedMessages };
          }
          console.log("Partial response");
          if (!comePartialResponse) {
            comePartialResponse = true;
            return {
              messages: [...state.messages, partialResponse]
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
    }
  })),
  withHooks(() => ({}))

);
