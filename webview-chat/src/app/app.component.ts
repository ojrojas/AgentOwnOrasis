import { Component, OnInit } from '@angular/core';
import { ChatContainerComponent } from './container/chat-container/chat-container.component';

@Component({
  selector: 'app-root',
  imports: [ChatContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent  {
  title = 'webview-chat';
}
