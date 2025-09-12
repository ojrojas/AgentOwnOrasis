import { Component, inject } from '@angular/core';
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

  async onSave() {
    const providers = this.settingsStore.providers()!;
    const updatedProviders = providers.map(provider => {
      if (provider.id === this.provider) {
        return {
          ...provider, ...{
            id: this.provider,
            apiKey: this.apiKey,
            baseUrl: this.baseUrl,
            extraOptions: [],
          }
        };
      }
      return provider;
    });

    ///this.settingsStore.setConfiguration(updatedProviders);
  }

}
