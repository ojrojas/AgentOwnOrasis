import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { ChatStore } from '../../../store/chat/chat.store';
import { IChat } from '../../../core/types/chat.type';
import { MatCardModule } from "@angular/material/card";

@Component({
  selector: 'app-chat-list',
  imports: [
    CommonModule,
    MatListModule,
    MatCardModule
],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.scss'
})
export class ChatListComponent {
  @Output() chatSelected = new EventEmitter<string>();
  readonly chatStore = inject(ChatStore);

  getLastUserMessage(chat: IChat): string | undefined {
    if (!chat?.messages?.length) { return undefined; }

    const userMessages = chat.messages.filter(m => m.role === 'user');

    return userMessages.at(-1)?.content;
  }
}
