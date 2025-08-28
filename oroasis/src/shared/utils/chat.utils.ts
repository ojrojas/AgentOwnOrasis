import * as vscode from 'vscode';
import { ChatResponse, GenerateResponse } from 'ollama';

export function sendToWebview(
    panel: vscode.WebviewPanel,
    type: string,
    requestId?: string,
    payload?: any
) {
    panel.webview.postMessage({ type, requestId, payload });
}

export function isChatResponse(obj: any): obj is ChatResponse {
    return obj && typeof obj === "object" && "message" in obj;
}

export function isGenerateResponse(obj: any): obj is GenerateResponse {
    return obj && typeof obj === "object" && "response" in obj;
}
