import { Component, EventEmitter, Output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { matAddOutline, matHistoryOutline, matSettingsOutline, matCloseOutline } from '@ng-icons/material-icons/outline';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, NgIcon],
  templateUrl: `chat-header.component.html`,
  styleUrl: `chat-header.component.scss`,
  viewProviders: [provideIcons({ matAddOutline, matHistoryOutline, matSettingsOutline, matCloseOutline })]
})
export class ChatHeaderComponent {
  @Output() onHistory = new EventEmitter<void>();

  onNewChat() {
    console.log('New chat clicked');
  }

  onSettings() {
    console.log('Settings clicked');
  }

  onClose() {
    console.log('Close clicked');
  }
}
