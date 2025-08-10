import { Component, Output, EventEmitter, Input, HostBinding, inject, OnInit } from '@angular/core';

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
import { ChatStore } from '../../../store/chat-store';
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

  messageText: string = '';

  get placeholder(): string {
    return this.isLoading
      ? ''
      : '@ to mention, ⌘L to add a selection. Enter instructions...';
  }

  activeMicrophone() {
    this.isActiveMicrophone = !this.isActiveMicrophone;
    console.log("micro is :", this.isActiveMicrophone);
  }

  onEnterPressed(event: any): void {
    if (event.key === 'Enter' && !event.shiftKey && this.modelText.length !== 0) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
    if (this.messageText.trim() && !this.isLoading) {
      this.messageSent.emit({
        content: this.messageText,
        role: 'user',
        id: uuidv4(),
        timestamp: new Date(),
        model: this.modelText
      });
      this.messageText = '';
    }
  }
}
