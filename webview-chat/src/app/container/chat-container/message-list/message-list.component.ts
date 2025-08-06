import { Component, Input, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';

import { MessageComponent } from '../message/message.component';
import { IMessage } from '../../../core/types/message.type';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [MessageComponent],
  templateUrl: `message-list.component.html`,
  styleUrl: `message-list.component.scss`
})
export class MessageListComponent implements AfterViewChecked {
  @Input() messages: IMessage[] = [];
  @Input() isTyping: boolean = false;
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (this.messageContainer) {
      const container = this.messageContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }

  trackByMessageId(index: number, message: IMessage): string {
    return message.id ?? index;
  }
}
