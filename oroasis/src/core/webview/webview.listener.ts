import { Disposable, Webview, WebviewPanel, WebviewView, window } from "vscode";

export class WebviewListeners {
  static attachVisibility(view: WebviewView | WebviewPanel, disposables: Disposable[], callback: () => void) {
    if ("onDidChangeViewState" in view) {
      view.onDidChangeViewState(callback, null, disposables);
    } else if ("onDidChangeVisibility" in view) {
      view.onDidChangeVisibility(callback, null, disposables);
    }
  }

  static attachMessageListener(webview: Webview, disposables: Disposable[]) {
    webview.onDidReceiveMessage(
      (message: any) => {
        window.showInformationMessage(JSON.stringify(message.data));
      },
      undefined,
      disposables
    );
  }
}
