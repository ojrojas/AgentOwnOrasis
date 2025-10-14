import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket$: WebSocket | null = null;
  private messageSubject = new Subject<string>();

  connect(): void {
    if (!this.socket$ || this.socket$.readyState !== WebSocket.OPEN) {
      this.socket$ = new WebSocket('ws://localhost:8080');

      this.socket$.onmessage = (event) => {
        this.messageSubject.next(event.data);
      };

      this.socket$.onclose = () => {
        console.log('WebSocket connection closed.');
      };
    }
  }

  onMessage(): Observable<string> {
    return this.messageSubject.asObservable();
  }

  disconnect(): void {
    if (this.socket$) {
      this.socket$.close();
      this.socket$ = null;
    }
  }
}
