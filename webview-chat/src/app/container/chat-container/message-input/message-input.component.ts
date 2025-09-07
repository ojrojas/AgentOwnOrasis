import { Component, Output, EventEmitter, Input, inject, effect, ViewChild, ElementRef } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { matSendOutline, matHourglassEmptyOutline, matMicOutline } from '@ng-icons/material-icons/outline';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from "@angular/material/card";
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { ChatStore } from '../../../store/chat/chat.store';
import { IMessage } from '../../../core/types/message.type';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgIcon,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
  ],
  templateUrl: `message-input.component.html`,
  styleUrl: `message-input.component.scss`,
  viewProviders: [provideIcons({ matSendOutline, matHourglassEmptyOutline, matMicOutline })]
})
export class MessageInputComponent {

  readonly chatStore = inject(ChatStore);
  @Input() isLoading: boolean = false;
  @Input() isActiveMicrophone = false;

  @Output() messageSent = new EventEmitter<IMessage>();
  modelText: string = '';
  typeMessage: string = 'Ask';
  messageText: string = '';

  constructor() {
    effect(() => {
      const list = this.chatStore.models()?.data ?? [];
      if (list.length) {
        this.chatStore.getPreferredModel().then(pref => {
          this.modelText = this.chatStore.preferredModel() ?? '';
        });
      }
    });
  }

  get placeholder(): string {
    return this.isLoading
      ? ''
      : '@ to mention, ⌘L to add a selection. Enter instructions...';
  }

  activeMicrophone() {
    this.isActiveMicrophone = !this.isActiveMicrophone;
    console.log("micro is :", this.isActiveMicrophone);
  }

  get isSendDisabled(): boolean {
    return !this.messageText.trim() || this.isLoading || !this.modelText?.trim();
  }

  get isMicDisabled(): boolean {
    return this.isLoading || !this.modelText?.trim();
  }

  onEnterPressed(event: any): void {
    if (event.key === 'Enter' && !event.shiftKey && this.modelText.length !== 0) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  async sendMessage(): Promise<void> {
    if (this.messageText.trim() && !this.isLoading) {
      const filesToSend = this.chatStore.resolveMentions(this.messageText);
      this.messageSent.emit({
        content: this.messageText,
        role: 'user',
        id: uuidv4(),
        timestamp: new Date(),
        model: this.modelText,
        type: this.typeMessage,
        files: filesToSend
      });
      this.messageText = '';
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key !== '@') {
      return;
    }

    console.log("KeyPress:", event.key);
    event.preventDefault();

    const dropdown = document.getElementById('fileDropdown') as HTMLDivElement | null;
    if (!dropdown) { return; }

    dropdown.innerHTML = '';

    this.chatStore.files().forEach(filePath => {
      const fileName = filePath.split(/[/\\]/).pop() || '';

      const ul = document.createElement('ul');
      ul.classList.add("list-append-file");
      const li = document.createElement('li');
      li.textContent = fileName;
      li.tabIndex = 0;

      li.addEventListener('click', () => {
        this.messageText += `@${fileName} `;
        dropdown.classList.remove('show');
      });

      ul.appendChild(li);

      dropdown.appendChild(ul);
    });

    if (this.chatStore.files().length > 0) {
      dropdown.classList.add('show');
    }
  }
}
