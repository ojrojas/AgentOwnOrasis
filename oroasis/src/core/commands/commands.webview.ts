import { commands, ExtensionContext, OutputChannel, Uri, ViewColumn, window } from 'vscode';
import { WebviewProvider } from '../../providers/webview/webview.provider';
import path from 'path';
import { IOllamaApiService } from '../services/ollama.interface.service';

// Webviews
export const openPanelCommand = async (context: ExtensionContext, outputChannel: OutputChannel, ollamaService: IOllamaApiService) => {
    const tabWebview = new WebviewProvider(context, outputChannel, ollamaService);
    const lastCol = Math.max(...window.visibleTextEditors.map((editor) => editor.viewColumn || 0));

    const hasVisibleEditors = window.visibleTextEditors.length > 0;
    if (!hasVisibleEditors) {
        await commands.executeCommand("workbench.action.newGroupRight");
    }
    const targetCol = hasVisibleEditors ? Math.max(lastCol + 1, 1) : ViewColumn.Two;

    const panel = window.createWebviewPanel(WebviewProvider.SecodarySidebar, "Orasis", targetCol, {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [Uri.file(path.join(context.extensionPath, "webview-agents/dist"))],
    });

    panel.iconPath = {
        light: Uri.joinPath(context.extensionUri, "resources", "chatbot_icon.png"),
        dark: Uri.joinPath(context.extensionUri, "resources", "chatbot_icon.png"),
    };
    tabWebview.resolveWebviewView(panel);

    await commands.executeCommand("workbench.action.lockEditorGroup");
};

