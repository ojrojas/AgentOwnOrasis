import { WebviewViewProvider, WebviewView, WebviewPanel, Disposable, ExtensionContext, OutputChannel, workspace, ExtensionMode } from "vscode";
import { registerChatCommands } from "../../core/commands/webview.commands.chat";
import { registerWorkspaceCommands } from "../../core/commands/webview.workspace.commnads";
import { IProviderFactory } from "../../core/services/provider.factory.service";
import { ProvidersMap } from "../../core/types/provider.type";
import { WebviewListeners } from "../../core/webview/webview.listener";
import { WebviewHtmlBuilder } from "../../core/webview/webviewhtml.builder";
import { getNonce } from "../../shared/generics/nonce";
import { registerConfigCommands } from "../../core/commands/config.commands";
import { IWebviewConfiguration } from "../../core/types/webview-configuration.type";


export class WebviewProvider implements WebviewViewProvider {
    static readonly PrimarySidebar = "oroasis.primary-sidebar-provider";
    static readonly SecodarySidebar = "oroasis.secondary-sidebar-provider";
    static readonly TabPanel = "oroasis.tabpanel-provider";

    static readonly LOCAL_PORT = 4200;
    static readonly LOCAL_SERVER_URL = `localhost:${WebviewProvider.LOCAL_PORT}`;

    private static activeInstances: Set<WebviewProvider> = new Set();

    view?: WebviewView | WebviewPanel;
    disposables: Disposable[] = [];
    model?: string;

    constructor(
        readonly props: IWebviewConfiguration
    ) {
        WebviewProvider.activeInstances.add(this);
        const settings = workspace.getConfiguration("oroasisSettings");
        this.model = settings.get("modelDefault");
    }

    async dispose() {
        if (this.view) {
            (this.view as WebviewPanel).dispose();
        }

        while (this.disposables.length) {
            this.disposables.pop()?.dispose();
        }

        WebviewProvider.activeInstances.delete(this);
    }

    static getActiveInstance() {
        return [...this.activeInstances].find(
            i => i.view && (i.view as WebviewPanel).active
        );
    }

    async resolveWebviewView(view: WebviewView | WebviewPanel) {
        this.view = view;
        const webview = view.webview;

        webview.options = {
            enableScripts: true,
            localResourceRoots: [this.props.context.extensionUri]
        };

        const builder = new WebviewHtmlBuilder(this.props.context);
        const nonce = getNonce();

        webview.html =
            this.props.context.extensionMode === ExtensionMode.Development
                ? builder.buildDevHtml(
                    webview,
                    nonce,
                    WebviewProvider.LOCAL_SERVER_URL,
                    WebviewProvider.LOCAL_PORT
                )
                : builder.buildProdHtml(webview, nonce);

        WebviewListeners.attachMessageListener(webview, this.disposables);
        WebviewListeners.attachVisibility(view, this.disposables, () => WebviewListeners.attachMessageListener(webview, this.disposables));

        if (view) {
            const settings = workspace.getConfiguration("oroasisSettings");
            const defaultProvider = settings.get<string>('providerDefault') || 'ollama';
            const factory = new IProviderFactory(this.props.providersMap);

            registerWorkspaceCommands(view as WebviewPanel, this.props.outputChannel);
            registerChatCommands(view as WebviewPanel, factory, defaultProvider, this.props.chatRepository, this.props.outputChannel);
            registerConfigCommands(view as WebviewPanel, this.props.providerRepository, this.props.outputChannel);
        }

        view.onDidDispose(() => this.dispose(), null, this.disposables);
        workspace.onDidChangeConfiguration(
            () => WebviewListeners.attachMessageListener(webview, this.disposables),
            null,
            this.disposables
        );

        this.props.outputChannel.appendLine("Webview resolved");
    }
}
