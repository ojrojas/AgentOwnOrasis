import { CancellationToken, Disposable, Webview, WebviewPanel, WebviewView, WebviewViewProvider, WebviewViewResolveContext } from 'vscode'


export class WebviewProvider implements WebviewViewProvider {
    static readonly PrimarySidebar: string = "oroasis.primary-sidebar-provider";
    static readonly SecodarySidebar: string = "oroasis.secondary-sidebar-provider";
    static readonly TabPanel: string = "oroasis.tabpanel-provider";
    view?: WebviewView | WebviewPanel;
    disposables: Disposable;

    resolveWebviewView(webviewView: WebviewView, context: WebviewViewResolveContext, token: CancellationToken): Thenable<void> | void {
        throw new Error('Method not implemented.');
    }

}