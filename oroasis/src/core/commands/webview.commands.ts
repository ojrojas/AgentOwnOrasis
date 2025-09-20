import { commands, Uri, ViewColumn, window } from 'vscode';
import { WebviewProvider } from "../../providers/webview/WebviewProvider";
import path from 'path';
import { IWebviewConfiguration } from '../types/webview-configuration.type';

export const openPanelCommand = async (props: IWebviewConfiguration) => {
    const tabWebview = new WebviewProvider(props);

    const lastCol = Math.max(...window.visibleTextEditors.map((editor) => editor.viewColumn || 0));
    const hasVisibleEditors = window.visibleTextEditors.length > 0;
    if (!hasVisibleEditors) {
        await commands.executeCommand("workbench.action.newGroupRight");
    }
    const targetCol = hasVisibleEditors ? Math.max(lastCol + 1, 1) : ViewColumn.Two;

    const panel = window.createWebviewPanel(WebviewProvider.SecodarySidebar, "Orasis", targetCol, {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [Uri.file(path.join(props.context.extensionPath, "webview-chat/dist"))],
    });

    panel.iconPath = {
        light: Uri.joinPath(props.context.extensionUri, "resources", "chatbot_icon.png"),
        dark: Uri.joinPath(props.context.extensionUri, "resources", "chatbot_icon.png"),
    };

    tabWebview.resolveWebviewView(panel);

    await commands.executeCommand("workbench.action.lockEditorGroup");
};
