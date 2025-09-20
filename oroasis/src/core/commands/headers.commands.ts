import { WebviewPanel } from "vscode";
import { sendToWebview } from "../../shared/utils/chat.utils";
import { v4 as uuidv4 } from 'uuid';

export const newHeaderButtonCommand = (panel: WebviewPanel) => {
    sendToWebview(panel, "headerMessage", uuidv4(), { type: 'new' });
};

export const historyHeaderButtonCommand = (panel: WebviewPanel) => {
    sendToWebview(panel, "headerMessage", uuidv4(), { type: 'history' });
};

export const settingsHeaderButtonCommand = (panel: WebviewPanel) => {
    sendToWebview(panel, "headerMessage", uuidv4(), { type: 'settings' });
};

export const closeHeaderButtonCommand = (panel: WebviewPanel) => {
    panel.dispose();
};