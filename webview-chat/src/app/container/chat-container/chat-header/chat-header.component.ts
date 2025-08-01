import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule],
  templateUrl: `chat-header.component.html`,
  styleUrl: `chat-header.component.scss`
})
export class ChatHeaderComponent {
  onNewChat() {
    console.log('New chat clicked');
  }

  onHistory() {
    console.log('History clicked');
  }

  onSettings() {
    console.log('Settings clicked');
  }

  onClose() {
    console.log('Close clicked');
  }
}
