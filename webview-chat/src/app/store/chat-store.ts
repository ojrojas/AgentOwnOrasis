import { patchState, signalState, signalStore, withComputed, withHooks, withMethods, withState } from "@ngrx/signals";
import { IMessage } from "../core/types/message.type";
import { IListModelsResponse } from "../core/types/models.types";
import { setFulfilled, setPending, withRequestStatus } from "./request.status";
import { withLogger } from "./logger.state";
import { computed, inject } from "@angular/core";
import { VscodeService } from "../core/services/vscode-service";

type ChatState = {
  isLoading: boolean;
  error: string | undefined;
  models: IListModelsResponse | undefined;
  messages: IMessage[]
}

const chatState = signalState<ChatState>({
  error: undefined,
  isLoading: false,
  messages: [],
  models: undefined
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
    async sendChat(message: IMessage) {
        patchState(store, (state) => ({
        messages: [...state.messages, message]
      }));

      patchState(store, setPending());
      const response = await vscodeService.request('sendChat', message);
      patchState(store, (state) => ({
        messages: [...state.messages, response as IMessage]
      }));

      patchState(store, setFulfilled());
    },
    async loadModels() {
      patchState(store, setPending());
      const response = await vscodeService.request<IListModelsResponse>("getModels");
      patchState(store, { models: response }, setFulfilled());
    }
  })),
  withHooks(() => ({}))

);
