import { Component, Inject, OnInit } from '@angular/core';
import { ChatContainerComponent } from './container/chat-container/chat-container.component';
import { WebSocketService } from './core/services/websocket.service';

@Component({
  selector: 'app-root',
  imports: [ChatContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'webview-chat';

  constructor(@Inject(WebSocketService) private websocketService: WebSocketService) {}

  ngOnInit() {
    this.websocketService.connect();
    this.websocketService.onMessage().subscribe((message: string) => {
      console.log('Real-time message received:', message);
    });
  }
}
