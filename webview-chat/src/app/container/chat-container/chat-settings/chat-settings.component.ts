import { Component, computed, effect, inject } from '@angular/core';
import { MatInput } from "@angular/material/input";
import { MatSelectModule } from '@angular/material/select';
import { ChatStore } from '../../../store/chat/chat.store';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCard } from "@angular/material/card";
import { SettingsStore } from '../../../store/settings/settings.store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-settings',
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatCard,
    MatInput,
    ReactiveFormsModule
  ],
  templateUrl: './chat-settings.component.html',
  styleUrl: './chat-settings.component.scss'
})
export class ChatSettingsComponent {
  private formbuilder = inject(FormBuilder);
  readonly settingsStore = inject(SettingsStore);
  readonly chatStore = inject(ChatStore);
  emptyString = '';

  providerSettings = this.formbuilder.group({
    provider: ['', Validators.required],
    baseUrl: ['', Validators.nullValidator],
    apiKey: ['', Validators.nullValidator],
    modelRefactors: ['', Validators.required],
    modelCompletions: ['', Validators.required]
  });

  constructor() {
    const result = this.settingsStore.isConfigureVisible();
    console.log("hasConfigure", result);

    effect(() => {
      const providers = this.settingsStore.providers();
      const selected = providers?.find(p => p.isSelected);

      if (selected) {
        this.providerSettings.patchValue(
          {
            ...selected,
            provider: selected.id,
            modelCompletions: selected.completionModel,
            modelRefactors: selected.refactorModel,
          }, { emitEvent: false });
      }
    });
  }

  async onSave() {
    const providers = this.settingsStore.providers()!;
    const updatedProviders = providers.map(provider => {
      if (provider.id === this.providerSettings.value.provider) {
        return {
          ...provider, ...{
            id: this.providerSettings.value.provider ?? this.emptyString,
            isSelected: true,
            apiKey: this.providerSettings.value.apiKey ?? this.emptyString,
            baseUrl: this.providerSettings.value.baseUrl ?? this.emptyString,
            refactorModel: this.providerSettings.value.modelRefactors ?? this.emptyString,
            completionModel: this.providerSettings.value.modelCompletions ?? this.emptyString,
          }
        };
      }
      return provider;
    });

    this.settingsStore.saveConfiguration(updatedProviders);
    this.settingsStore.setConfigVisible(false);
  }

  currentConfiguration = computed(() => {
    const existConfiguration = this.settingsStore.providers();
  });
}
