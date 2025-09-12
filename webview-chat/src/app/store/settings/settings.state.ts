import { IProviderConfig } from "../../core/types/provider.type";

export type SettingsState = {
  isLoading: boolean;
  error: string | undefined;
  providers: IProviderConfig[] | undefined;
};

export const initialStateSettings: SettingsState = {
  error: undefined,
  isLoading: false,
  providers: undefined
};
