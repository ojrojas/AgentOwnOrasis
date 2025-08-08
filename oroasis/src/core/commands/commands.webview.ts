import {
    commands,
    ExtensionContext,
    OutputChannel,
    Uri,
    ViewColumn,
    Webview,
    WebviewView,
    window,
    workspace
} from 'vscode';
import { WebviewProvider } from '../../providers/webview/webview.provider';
import path from 'path';
import { IOllamaApiService } from '../interfaces/ollama.interface.service';
import { WorkspaceStateRepository } from '../services/workspace-repository.service';
import { IChatMessage } from '../types/chat-message.type';
import { v4 as uuidv4 } from 'uuid';


// Webviews
export const openPanelCommand = async (context: ExtensionContext, outputChannel: OutputChannel, ollamaService: IOllamaApiService, chatMessageRepository: WorkspaceStateRepository<IChatMessage>) => {
    const tabWebview = new WebviewProvider(context, outputChannel, ollamaService, chatMessageRepository);
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


export const commandOnDidReceived = async (
    webview: Webview,
    preferredModel: string,
    chatRepository: WorkspaceStateRepository<IChatMessage>,
    ollamaService: IOllamaApiService,
    message: any) => {
    const { type, requestId, payload } = message;
    switch (type) {
        case 'emitStatusAppChat:request':
            const appData = { id: '200OK', name: 'OrasisApp' }; // Simula lógica
            webview.postMessage({
                type: 'emitStatusAppChat:response',
                requestId,
                payload: appData,
            });
            break;
        case 'getModels:request':
            const models = await ollamaService.listModels();

            webview.postMessage({
                type: 'getModels:response',
                requestId,
                payload: models,
            });
            break;


        case 'getPreferredModel:request':
            webview.postMessage({
                type: 'getPreferredModel:response',
                requestId,
                payload: preferredModel,
            });
            break;

        case 'sendChat:request':
            await chatRepository.insert(payload);
            const messages = chatRepository.findAllSync().map(item => ({
                content: item.content,
                role: item.role
            }));

            const response = await ollamaService.chat({
                model: payload.model,
                messages: messages
            });

            let accumulated = '';
            for await (const chunk of response) {
                // const token = chunk.message.content || '';
                accumulated += chunk.message.content || '';

                webview.postMessage({
                    type: 'sendChat:response',
                    requestId,
                    payload: {
                        content: accumulated,
                        role: 'assistant',
                        done: chunk.done,
                        id: uuidv4()
                    },
                });
            }

            await chatRepository.insert({
                content: accumulated,
                id: uuidv4(),
                role: 'assistant'
            });

            webview.postMessage({
                type: 'sendChat:response:done'
            });
            break;

        default:
            break;
    }
};
