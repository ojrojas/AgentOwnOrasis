import {
    CancellationToken,
    Disposable,
    ExtensionContext,
    ExtensionMode,
    OutputChannel,
    Webview,
    WebviewPanel,
    WebviewView,
    WebviewViewProvider,
    WebviewViewResolveContext,
    window,
    workspace
} from 'vscode';
import { findLast } from '../../shared/collections/array';
import { getNonce } from '../../shared/generics/nonce';
import { getUri } from '../../shared/generics/uri';
import { get, IncomingMessage } from 'node:http';

export class WebviewProvider implements WebviewViewProvider {
    static readonly PrimarySidebar: string = "oroasis.primary-sidebar-provider";
    static readonly SecodarySidebar: string = "oroasis.secondary-sidebar-provider";
    static readonly TabPanel: string = "oroasis.tabpanel-provider";
    private static activeInstances: Set<WebviewProvider> = new Set();
    view?: WebviewView | WebviewPanel;
    disposables: Disposable[] = [];

    constructor(
        readonly context: ExtensionContext,
        private readonly outputChannel: OutputChannel
    ) {
        WebviewProvider.activeInstances.add(this);
    }

    async dispose() {
        if (this.view && 'dispose' in this.view) {
            this.view.dispose();
        }
        while (this.disposables.length) {
            const dispose = this.disposables.pop();
            if (dispose) {
                dispose.dispose();
            }
        }

        WebviewProvider.activeInstances.delete(this);
    }

    public getVisibleInstance(): WebviewProvider | undefined {
        return findLast(Array.from(WebviewProvider.activeInstances), (instance) => instance.view?.visible === true);
    }

    public getAllInstances(): WebviewProvider[] {
        return Array.from(WebviewProvider.activeInstances);
    }

    public getSidebarInstance(): WebviewProvider | undefined {
        return Array.from(WebviewProvider.activeInstances).find((instance) => instance.view && "onDidChangeVisibility" in instance.view);
    }


    async resolveWebviewView(
        webviewView: WebviewView | WebviewPanel) {
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri]
        };

        webviewView.webview.html =
           ( this.context.extensionMode === ExtensionMode.Development
                ? await this.getHRMHtmlForWebview(webviewView.webview)
                : this.getHtmlForWebview(webviewView.webview)).trim();

        this.setWebviewMessageListener(webviewView.webview);

        if ("onDidChangeViewState" in webviewView) {
            // WebviewView and WebviewPanel have all the same properties except for this visibility listener
            // panel
            webviewView.onDidChangeViewState(
                () => {
                    if (this.view?.visible) {
                        this.setWebviewMessageListener(webviewView.webview);
                    }
                },
                null,
                this.disposables,
            );
        } else if ("onDidChangeVisibility" in webviewView) {
            // sidebar
            webviewView.onDidChangeVisibility(
                () => {
                    this.setWebviewMessageListener(webviewView.webview);
                },
                null,
                this.disposables,
            );
        }

        // Listen for when the view is disposed
        // This happens when the user closes the view or when the view is closed programmatically
        webviewView.onDidDispose(
            async () => {
                await this.dispose();
            },
            null,
            this.disposables,
        );

        // // if the extension is starting a new session, clear previous task state
        // this.clearTask()
        {
            // Listen for configuration changes
            workspace.onDidChangeConfiguration(
                async (e) => {
                    this.setWebviewMessageListener(webviewView.webview);
                },
                null,
                this.disposables,
            );

            // if the extension is starting a new session, clear previous task state

            this.outputChannel.appendLine("Webview view resolved");
        }
    }


    /**
    * Returns html of the start page (index.html)
    */
    private async getHRMHtmlForWebview(webview: Webview) {

        const localPort = 5173;
        const localServerUrl = `localhost:${localPort}`;
        let content: string = "";
        // Check if local dev server is running.
        const response = await this.fetch(`http://${localServerUrl}`);
        try {
            response.on('end', () => {
                window.showInformationMessage("Connecting HMR Component Status: " + response.statusMessage?.toString()!);
                window.showInformationMessage("complete read HMR component");
            });

        } catch (error) {
            window.showErrorMessage(
                "Orasis: Local webview dev server is not running, HMR will not work. Please run 'npm run dev:webview' before launching the extension to enable HMR. Using bundled assets.",
            );

            return this.getHtmlForWebview(webview);
        }

        // The CSS file from the Angular build output
        const stylesUri = `http://${localServerUrl}/src/index.css`;
        const stylesAppUri = `http://${localServerUrl}/src/App.css`;

        // The JS files from the Angular webview-agents output
        const scriptUri = `http://${localServerUrl}/src/main.tsx`;
        const viteClient = `http://${localServerUrl}/@vite/client`;
        const reactRefresh = `http://${localServerUrl}/@react-refresh`;

        const html = await this.readDataResponse(response);
        const nonce = getNonce();

        const csp = [
			`font-src csp-source data:`,
			`style-src csp-source 'unsafe-inline' https://* http://${localServerUrl} http://0.0.0.0:${localPort}`,
			`img-src csp-source https: data:`,
			`connect-src https://* ws://${localServerUrl} ws://0.0.0.0:${localPort} http://${localServerUrl} http://0.0.0.0:${localPort}`,
		];

        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
        <script type="module" nonce="${nonce}" src=${reactRefresh}></script>
        <script type="module" nonce="${nonce}" src=${viteClient}></script>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="Content-Security-Policy" content="${csp.join("; ")}">
        <title>Orasis</title>
        </head>
        <body>
        <div id="root"></div>
        <script type="module" nonce="${nonce}">
            const vscode = acquireVsCodeApi();
        </script>
          <script type="module" src="${scriptUri}" nonce="${nonce}></script>
        </body>
      </html>
    `;
    }


    /**
  * Returns html of the start page (index.html)
  */
    private getHtmlForWebview(webview: Webview) {
        // The CSS file from the Angular build output
        const stylesUri = getUri(webview, this.context.extensionUri, ["webview-agents", "dist", "webview-agents", "browser", "styles.css"]);
        // The JS files from the Angular webview-agents output
        // const runtimeUri = getUri(webview, this.context.extensionUri, ["webview-agents", "dist", "webview-agents" , "browser", "runtime.js"]);
        const polyfillsUri = getUri(webview, this.context.extensionUri, ["webview-agents", "dist", "webview-agents", "browser", "polyfills.js"]);
        const scriptUri = getUri(webview, this.context.extensionUri, ["webview-agents", "dist", "webview-agents", "browser", "main.js"]);

        const indexUri = getUri(webview, this.context.extensionUri, ["webview-agents", "dist", "webview-agents", "browser", "index.html"]);


        const nonce = getNonce();

        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Orasis</title>
        </head>
        <body>
          <div id="root"></div >
          <script>
           const vscode = acquireVsCodeApi();
          </script>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
    }

    private setWebviewMessageListener(webview: Webview) {
        webview.onDidReceiveMessage(
            (message: any) => {
                const command = message.command;
                const data = message.data;

                // switch (command) {
                //     case "hello":
                //         // Code that should run in response to the hello message command
                window.showInformationMessage(JSON.stringify(data));
                return;
                //     // Add more switch case statements here as more webview message commands
                //     // are created within the webview context (i.e. inside media/main.js)
                // }
            },
            undefined,
            this.disposables
        );
    }

    private readDataResponse(incoming: IncomingMessage) {
        let response = '';
        return new Promise<string>((resolve, reject) => {
            incoming.on('data', chunk => {
                response += chunk;
            });
            incoming.on('end', () => {
                resolve(response);
            });

            incoming.on('error', error => reject(error));
        });
    }

    private fetch(url: string, options?: any) {
        return new Promise<IncomingMessage>((resolve, reject) => {
            console.log("Fetching request...");
            get(url, (response) => {
                console.log("Fetching complete with status code: ", response.statusCode);
                resolve(response);
            })
                .on('abort', () => {
                    console.error('abort fetching');
                    reject(new Error("Error response http"));
                })
                .on('error', error => {
                    console.error('error fetching');
                    reject(error);
                });
        });
    }
}