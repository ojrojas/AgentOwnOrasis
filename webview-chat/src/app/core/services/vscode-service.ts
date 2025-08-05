import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class VscodeService {
  readonly vscode = acquireVsCodeApi();;
  private pendingRequests = new Map<string, (value: any) => void>();

  constructor() {
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  handleMessage = (event: MessageEvent<any>) => {
    const message = event.data;
    if (message?.type?.endsWith(':response') && message?.requestId) {
      const callback = this.pendingRequests.get(message.requestId);
      if (callback) {
        callback(message.payload);
        this.pendingRequests.delete(message.requestId);
      }
    }
  };

  public request<T>(type: string, payload?: T): Promise<T> {
    const requestId = uuidv4();
    const messageType = `${type}:request`;

    return new Promise((resolve) => {
      this.pendingRequests.set(requestId, resolve);
      this.vscode.postMessage({ type: messageType, requestId, payload });
    });
  }

  requestStream<T = any>(type: string, payload?: any): Observable<T> {
    const requestId = uuidv4();
    const vsCodeApi = window.acquireVsCodeApi();
    vsCodeApi.postMessage({ type: `${type}:request`, requestId, payload });

    return new Observable<T>((observer) => {
      const listener = (event: MessageEvent) => {
        const msg = event.data;
        if (!msg?.type?.startsWith(type) || msg.requestId !== requestId) return;

        if (msg.type.endsWith(':chunk')) {
          observer.next(msg.payload);
        } else if (msg.type.endsWith(':done')) {
          observer.complete();
          window.removeEventListener('message', listener);
        }
      };

      window.addEventListener('message', listener);
    });
  }

  public send(type: string, payload?: any) {
    this.vscode.postMessage({ type, payload });
  }

  public save(key: string, value: any) {
    const state = this.vscode.getState() ?? {};
    this.vscode.setState({ ...state, [key]: value });
  }

  public load<T>(key: string): T | null {
    const state = this.vscode.getState();
    return state?.[key] ?? null;
  }
}
