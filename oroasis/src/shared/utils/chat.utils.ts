import * as vscode from 'vscode';
import { IChatMessage, IGenerateMessage } from '../../core/types/chat-message.type';

export function sendToWebview(
    panel: vscode.WebviewPanel,
    type: string,
    requestId?: string,
    payload?: any
) {
    panel.webview.postMessage({ type, requestId, payload });
}

export function isChatResponse(obj: any): obj is IChatMessage {
    return obj && typeof obj === "object" && "message" in obj;
}

export function isGenerateResponse(obj: any): obj is IGenerateMessage {
    return obj && typeof obj === "object" && "response" in obj;
}

