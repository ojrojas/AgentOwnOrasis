import { patchState, signalState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { initialStateSettings, SettingsState } from "./settings.state";
import { setFulfilled, setPending, withRequestStatus } from "../request.status";
import { withLogger } from "../logger.state";
import { computed, inject } from "@angular/core";
import { VscodeService } from "../../core/services/vscode-service";
import { IProviderConfig } from "../../core/types/provider.type";

const settingsState = signalState<SettingsState>(initialStateSettings);

export const SettginsStore = signalStore(
  { providedIn: 'root' },
  withState(settingsState),
  withRequestStatus(),
  withLogger("Oroasis-Settings"),
  withComputed((state) => ({
    hasResponse: computed(() => state.isLoading),
    hasConfiguration: computed(() => {
      const configuration = state.providers()?.find(s => s.refactorModel !== '' && s.completionModel !== '');
      return configuration !== undefined;
    })
  })),
  withMethods((store, vscodeService = inject(VscodeService)) => ({
    async getConfiguration() {
      patchState(store, setPending());
      const providers = await vscodeService.request<IProviderConfig[]>('getConfiguration');
      patchState(store, { providers: providers }, setFulfilled());
    },

    async saveConfiguration(providers: IProviderConfig[]) {
      patchState(store, setPending());
      const saveOnSave = await vscodeService.request<IProviderConfig[]>('saveConfiguration', providers);
      patchState(store, { providers: saveOnSave }, setFulfilled());
    },

    setConfigVisible(visible: boolean) {
      patchState(store, setPending());
      patchState(store, { isConfigureVisible: visible }, setFulfilled());
    }
  })),
);
