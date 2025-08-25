import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  NgZone,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import { IMessage } from '../../../core/types/message.type';
import { MessageComponent } from '../message/message.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [MessageComponent, MatProgressBarModule],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.scss'
})
export class MessageListComponent implements AfterViewInit, OnDestroy {
  @Input() messages: IMessage[] = [];
  @Input() isTyping: boolean = false;
  @ViewChild('messageContainer') private messageContainer!: ElementRef<HTMLElement>;

  private zoneSub?: Subscription;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.zoneSub = this.ngZone.onStable.subscribe(() => this.scrollToBottom());
  }

  ngOnDestroy(): void {
    this.zoneSub?.unsubscribe();
  }

  private scrollToBottom(): void {
    if (!this.messageContainer) {return;}
    const container = this.messageContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }

  trackByMessageId(index: number, message: IMessage): string {
    return message.id ?? index.toString();
  }
}
