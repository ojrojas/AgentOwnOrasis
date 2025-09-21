import { Component, computed, inject } from '@angular/core';
import { MatInputModule, MatInput } from "@angular/material/input";
import { MatSelectModule } from '@angular/material/select';
import { ChatStore } from '../../../store/chat/chat.store';
import { FormsModule } from '@angular/forms';
import { MatCard } from "@angular/material/card";
import { SettginsStore } from '../../../store/settings/settings.store';

@Component({
  selector: 'app-chat-settings',
  imports: [
    FormsModule,
    MatSelectModule,
    MatCard,
    MatInput
  ],
  templateUrl: './chat-settings.component.html',
  styleUrl: './chat-settings.component.scss'
})
export class ChatSettingsComponent {
  readonly settingsStore = inject(SettginsStore);
  readonly chatStore = inject(ChatStore);
  modelCompletions: string = '';
  modelRefactors: string = '';
  baseUrl: string = '';
  provider: string = '';
  apiKey: string = '';

  constructor() {
    const result = this.settingsStore.isConfigureVisible();
    console.log("result hasConfigure", result);
  }

  async onSave() {
    const providers = this.settingsStore.providers()!;
    const updatedProviders = providers.map(provider => {
      if (provider.id === this.provider) {
        return {
          ...provider, ...{
            id: this.provider,
            isSelected: true,
            apiKey: this.apiKey,
            baseUrl: this.baseUrl,
            refactorModel: this.modelRefactors,
            completionModel: this.modelCompletions,
            extraOptions: [],
          }
        };
      }
      return provider;
    });

    this.settingsStore.saveConfiguration(updatedProviders);
  }

  currentConfiguration = computed(() => {
    const existConfiguration = this.settingsStore.providers();
  });
}
