import {
    commands,
    ExtensionContext,
    OutputChannel,
    Uri,
    ViewColumn,
    window
} from 'vscode';
import { WebviewProvider } from "../../providers/webview/WebviewProvider";
import path from 'path';
import { IChatMessage } from '../types/chat-message.type';
import { IWorkspaceStateRepository } from '../interfaces/workspace-repository-state.interface.service';
import { IProviderConfig, ProvidersMap } from '../types/provider.type';

export const openPanelCommand = async (
    context: ExtensionContext,
    outputChannel: OutputChannel,
    providerMap: ProvidersMap,
    chatMessageRepository: IWorkspaceStateRepository<IChatMessage>,
    providerRepository: IWorkspaceStateRepository<IProviderConfig>
) => {
    const tabWebview = new WebviewProvider(
        context,
        outputChannel,
        providerMap,
        chatMessageRepository,
        providerRepository
    );

    const lastCol = Math.max(...window.visibleTextEditors.map((editor) => editor.viewColumn || 0));
    const hasVisibleEditors = window.visibleTextEditors.length > 0;
    if (!hasVisibleEditors) {
        await commands.executeCommand("workbench.action.newGroupRight");
    }
    const targetCol = hasVisibleEditors ? Math.max(lastCol + 1, 1) : ViewColumn.Two;

    const panel = window.createWebviewPanel(WebviewProvider.SecodarySidebar, "Orasis", targetCol, {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [Uri.file(path.join(context.extensionPath, "webview-chat/dist"))],
    });

    panel.iconPath = {
        light: Uri.joinPath(context.extensionUri, "resources", "chatbot_icon.png"),
        dark: Uri.joinPath(context.extensionUri, "resources", "chatbot_icon.png"),
    };

    tabWebview.resolveWebviewView(panel);

    await commands.executeCommand("workbench.action.lockEditorGroup");
};
