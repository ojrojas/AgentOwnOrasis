import { window } from "vscode";
import { WebviewProvider } from "../../providers/webview/webview.provider";


export const registerWebView = (webViewProvider: WebviewProvider) => {
    return window.registerWebviewViewProvider(WebviewProvider.PrimarySidebar, webViewProvider, {
        webviewOptions: {
            retainContextWhenHidden: true
        }
    });
};