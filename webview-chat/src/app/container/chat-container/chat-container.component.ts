import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { ChatHeaderComponent } from './chat-header/chat-header.component';
import { MessageInputComponent } from './message-input/message-input.component';
import { MessageListComponent } from './message-list/message-list.component';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatStore } from '../../store/chat/chat.store';
import { IMessage } from '../../core/types/message.type';
import { IChat } from '../../core/types/chat.type';

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
export class ChatContainerComponent {
  readonly chatStore = inject(ChatStore);

  constructor() {
    effect(() => {
      this.chatStore.loadModels();
      this.chatStore.loadMessages();
      this.chatStore.getPreferredModel();
      this.chatStore.loadWorkSpaceFolders();
    });
  }

  onChatSelected(chatId: string) {
    this.chatStore.selectChat(chatId);
  }

  onMessageSent(message: IMessage): void {
    this.ensureChatAndSend(message);
  }

  private ensureChatAndSend(message: IMessage): void {
    let chatId = this.chatStore.selectedChatId();

    if (!chatId) {
      const newChat: IChat = { id: uuidv4(), messages: [] };
      this.chatStore.createChat(newChat);
      this.chatStore.selectChat(newChat.id);
      chatId = newChat.id;
    }

    message.chatId = chatId;
    const messageToSend = this.chatStore.postMessage(message);
    this.chatStore.sendChat(messageToSend);
  }

  currentMessages = computed(() => {
    const selectedId = this.chatStore.selectedChatId();
    return this.chatStore.listChat().find(c => c.id === selectedId)?.messages ?? [];
  });
}
