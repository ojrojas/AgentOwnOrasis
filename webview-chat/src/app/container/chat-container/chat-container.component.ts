import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { ChatHeaderComponent } from './chat-header/chat-header.component';
import { MessageInputComponent } from './message-input/message-input.component';
import { MessageListComponent } from './message-list/message-list.component';
import { ChatStore } from '../../store/chat-store';
import { IMessage } from '../../core/types/message.type';
import { ChatListComponent } from './chat-list/chat-list.component';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-chat-container',
  standalone: true,
  imports: [
    ChatHeaderComponent,
    MessageListComponent,
    MessageInputComponent,
    ChatListComponent,
    CommonModule
  ],
  templateUrl: 'chat-container.component.html',
  styleUrl: 'chat-container.component.scss'
})
export class ChatContainerComponent implements OnInit {
  readonly chatStore = inject(ChatStore);
  selectedChatId = signal<string | null>(null);


  async ngOnInit(): Promise<void> {
    await this.chatStore.loadModels();
    await this.chatStore.getPreferredModel();
    await this.chatStore.loadWorkSpaceFolders();
  }

  onChatSelected(chatId: string) {
    this.selectedChatId.set(chatId);
    this.chatStore.loadMessages(chatId);
  }

  onMessageSent(message: IMessage): void {
    if (!message.id) {
      message.id = uuidv4();
    }
    const messageToSend = this.chatStore.postMessage(message);
    this.chatStore.sendChat(messageToSend);
  }

  currentMessages = computed(() => {
    const selectedId = this.chatStore.selectedChatId();
    if (!selectedId) return [];
    return this.chatStore.listChat().find(c => c.id === selectedId)?.messages ?? [];
  });
}
