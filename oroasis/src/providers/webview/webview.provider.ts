import {
  Disposable,
  ExtensionContext,
  ExtensionMode,
  OutputChannel,
  WebviewPanel,
  WebviewView,
  WebviewViewProvider,
  workspace
} from "vscode";
import { getNonce } from "../../shared/generics/nonce";
import { IOllamaApiService } from "../../core/interfaces/provider.interface.service";
import { IChatMessage } from "../../core/types/chat-message.type";
import { IWorkspaceStateRepository } from "../../core/interfaces/workspace-repository-state.interface.service";
import { registerWorkspaceCommands } from "../../core/commands/webview.workspace.commnads";
import { registerChatCommands } from "../../core/commands/webview.commands.chat";
import { WebviewHtmlBuilder } from "../../core/webview/webviewhtml.builder";
import { WebviewListeners } from "../../core/webview/webview.listener";

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
    readonly context: ExtensionContext,
    private readonly outputChannel: OutputChannel,
    private readonly ollamaService: IOllamaApiService,
    private readonly chatRepository: IWorkspaceStateRepository<IChatMessage>
  ) {
    WebviewProvider.activeInstances.add(this);

    const settings = workspace.getConfiguration("oroasisSettings");
    this.model = settings.get("modelDefault");
  }

  async dispose() {
    if (this.view) {
      (this.view as WebviewPanel).dispose();
    }

    // Limpieza de disposables
    while (this.disposables.length) {
      this.disposables.pop()?.dispose();
    }

    WebviewProvider.activeInstances.delete(this);
  }

  static getActiveInstance() {
    return [...this.activeInstances].find(
      i => i.view && i.view as WebviewPanel && (i.view as WebviewPanel).active
    );
  }

  async resolveWebviewView(view: WebviewView | WebviewPanel) {
    this.view = view;
    const webview = view.webview;

    webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri]
    };

    const builder = new WebviewHtmlBuilder(this.context);
    const nonce = getNonce();

    webview.html =
      this.context.extensionMode === ExtensionMode.Development
        ? builder.buildDevHtml(
            webview,
            nonce,
            WebviewProvider.LOCAL_SERVER_URL,
            WebviewProvider.LOCAL_PORT
          )
        : builder.buildProdHtml(webview, nonce);

    // Listeners comunes
    WebviewListeners.attachMessageListener(webview, this.disposables);
    WebviewListeners.attachVisibility(view, this.disposables, () =>
      WebviewListeners.attachMessageListener(webview, this.disposables)
    );

    // Comandos (solo si es WebviewPanel, porque View no los necesita)
    if (view) {
      registerWorkspaceCommands(this.context, view as WebviewPanel, this.outputChannel);
      registerChatCommands(
        this.context,
        view as WebviewPanel,
        this.ollamaService,
        this.chatRepository,
        this.outputChannel
      );
    }

    // Eventos
    view.onDidDispose(() => this.dispose(), null, this.disposables);
    workspace.onDidChangeConfiguration(
      () => WebviewListeners.attachMessageListener(webview, this.disposables),
      null,
      this.disposables
    );

    this.outputChannel.appendLine("Webview resolved");
  }
}
