import { Component, inject, OnInit } from '@angular/core';

import { ChatHeaderComponent } from './chat-header/chat-header.component';
import { MessageInputComponent } from './message-input/message-input.component';
import { MessageListComponent } from './message-list/message-list.component';
import { ChatStore } from '../../store/chat-store';
import { IMessage } from '../../core/types/message.type';

@Component({
  selector: 'app-chat-container',
  standalone: true,
  imports: [
    ChatHeaderComponent,
    MessageListComponent,
    MessageInputComponent
  ],
  templateUrl: 'chat-container.component.html',
  styleUrl: 'chat-container.component.scss'
})
export class ChatContainerComponent implements OnInit {
  readonly chatStore = inject(ChatStore);

  async ngOnInit(): Promise<void> {
    await this.chatStore.loadModels();
    await this.chatStore.getPreferredModel();
    await this.chatStore.loadWorkSpaceFolders();
  }

  async onMessageSent(message: IMessage): Promise<void> {
    await this.chatStore.postMessage(message);
    this.chatStore.sendChat(message);
    console.log('visual studio');
  }
}
