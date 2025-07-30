import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: `message-input.component.html`,
  styleUrl: `message-input.component.scss`
})
export class MessageInputComponent {
  @Input() isLoading: boolean = false;
  @Output() messageSent = new EventEmitter<string>();

  messageText: string = '';

  get placeholder(): string {
    return this.isLoading
      ? 'Esperando respuesta...'
      : '@ to mention, ⌘L to add a selection. Enter instructions...';
  }

  onEnterPressed(event: any): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
    if (this.messageText.trim() && !this.isLoading) {
      this.messageSent.emit(this.messageText.trim());
      this.messageText = '';
    }
  }
}
