import { IProviderConfig } from "../../core/types/provider.type";

export type SettingsState = {
  isLoading: boolean;
  error: string | undefined;
  providers: IProviderConfig[] | undefined;
  isConfigureVisible: boolean;
};

export const initialStateSettings: SettingsState = {
  error: undefined,
  isLoading: false,
  providers: undefined,
  isConfigureVisible: false
};
