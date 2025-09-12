import { patchState, signalState, signalStore, withMethods, withState } from "@ngrx/signals";
import { initialStateSettings, SettingsState } from "./settings.state";
import { setFulfilled, setPending, withRequestStatus } from "../request.status";
import { withLogger } from "../logger.state";
import { inject } from "@angular/core";
import { VscodeService } from "../../core/services/vscode-service";
import { IProviderConfig } from "../../core/types/provider.type";

const settingsState = signalState<SettingsState>(initialStateSettings);

export const SettginsStore = signalStore(
  { providedIn: 'root' },
  withState(settingsState),
  withRequestStatus(),
  withLogger("Oroasis"),
  withMethods((store, vscodeService = inject(VscodeService)) => ({
    async getConfiguration() {
      patchState(store, setPending());
      const providers = await vscodeService.request<IProviderConfig[]>('getConfiguration');
      patchState(store, { providers: providers }, setFulfilled());
    }
  })),


);
