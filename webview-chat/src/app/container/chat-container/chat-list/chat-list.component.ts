import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-chat-list',
  imports: [
    CommonModule
  ],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.scss'
})
export class ChatListComponent {
  @Output() chatSelected = new EventEmitter<string>();

  chats = [
    { id: '1', name: 'Chat A' },
    { id: '2', name: 'Chat B' },
  ];
}
