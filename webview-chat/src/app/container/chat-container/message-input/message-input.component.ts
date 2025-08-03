import { Component, Output, EventEmitter, Input } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { matSendOutline, matHourglassEmptyOutline, matMicNoneOutline, matMicOutline } from '@ng-icons/material-icons/outline';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from "@angular/material/card";
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgIcon,
    MatIconModule,
    MatCardModule,
    MatSelectModule
  ],
  templateUrl: `message-input.component.html`,
  styleUrl: `message-input.component.scss`,
  viewProviders: [provideIcons({ matSendOutline, matHourglassEmptyOutline })]
})
export class MessageInputComponent {
activeMicrophone() {
throw new Error('Method not implemented.');
}
  @Input() isLoading: boolean = false;

  @Output() messageSent = new EventEmitter<string>();

  messageText: string = '';

  foods = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];


  get placeholder(): string {
    return this.isLoading
      ? 'Waiting for response...'
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
