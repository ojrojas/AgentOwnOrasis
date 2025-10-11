import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { MessageInputComponent } from './message-input/message-input.component';
import { MessageListComponent } from './message-list/message-list.component';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatStore } from '../../store/chat/chat.store';
import { IMessage } from '../../core/types/message.type';
import { IChat } from '../../core/types/chat.type';
import { VscodeService } from '../../core/services/vscode-service';
import { ChatSettingsComponent } from "./chat-settings/chat-settings.component";
import { SettingsStore } from '../../store/settings/settings.store';

@Component({
  selector: 'app-chat-container',
  standalone: true,
  imports: [
    MessageListComponent,
    MessageInputComponent,
    ChatListComponent,
    CommonModule,
    ChatSettingsComponent
  ],
  templateUrl: 'chat-container.component.html',
  styleUrl: 'chat-container.component.scss'
})
export class ChatContainerComponent {
  readonly chatStore = inject(ChatStore);
  readonly vscode = inject(VscodeService);
  readonly settingsStore = inject(SettingsStore);

  constructor() {
    effect(() => {
      this.settingsStore.getConfiguration();
      this.chatStore.loadModels();
      this.chatStore.loadMessages();
      this.chatStore.loadWorkSpaceFolders();
    });

    this.vscode.onMessage("headerMessage", (payload) => { this.onHandlerHeader(payload); });
  }

  onHandlerHeader(payload: any) {
    switch (payload.type) {
      case 'new':
      case 'history':
        this.chatStore.backToChatList();
        break;
      case 'settings':
        this.settingsStore.setConfigVisible(!this.settingsStore.isConfigureVisible());
        break;
    }
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
      const newChat: IChat = { id: uuidv4(), messages: [message] };
      this.chatStore.createChat(newChat);
      this.chatStore.selectChat(newChat.id);
      chatId = newChat.id;
    }
    else {
      message.chatId = chatId;
      this.chatStore.addMessages(message);
    }

    this.chatStore.sendChat(message);
  }

  currentMessages = computed(() => {
    const selectedId = this.chatStore.selectedChatId();
    return this.chatStore.listChat().find(c => c.id === selectedId)?.messages ?? [];
  });
}
