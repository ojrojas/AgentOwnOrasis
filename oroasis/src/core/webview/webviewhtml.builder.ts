import { ExtensionContext, Webview } from "vscode";
import { getUri } from "../../shared/generics/uri";

export class WebviewHtmlBuilder {
  constructor(private readonly context: ExtensionContext) {}

  buildDevHtml(webview: Webview, nonce: string, localUrl: string, localPort: number): string {
    const csp = [
      "default-src 'none'",
      `font-src ${webview.cspSource} 'nonce-${nonce}'`,
      `style-src ${webview.cspSource} 'unsafe-inline' https://* http://${localUrl} http://0.0.0.0:${localPort}`,
      `img-src ${webview.cspSource} https: data:`,
      `script-src 'unsafe-eval' https://* http://${localUrl} http://0.0.0.0:${localPort} 'nonce-${nonce}'`,
      `connect-src https://* ws://${localUrl} ws://0.0.0.0:${localPort} http://127.0.0.1:11434 http://${localUrl} http://0.0.0.0:${localPort}`,
    ];

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <script type="module" nonce="${nonce}" src="http://${localUrl}/@vite/client"></script>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="${csp.join("; ")}">
          <link href="http://${localUrl}/styles.css" rel="stylesheet">
          <title>Orasis</title>
        </head>
        <body>
          <app-root></app-root>
          <script type="module" nonce="${nonce}" src="http://${localUrl}/polyfills.js"></script>
          <script type="module" nonce="${nonce}" src="http://${localUrl}/main.js"></script>
        </body>
      </html>
    `;
  }

  buildProdHtml(webview: Webview, nonce: string): string {
    const stylesUri = getUri(webview, this.context.extensionUri, ["webview-chat", "dist", "webview-chat", "browser", "styles.css"]);
    const scriptUri = getUri(webview, this.context.extensionUri, ["webview-chat", "dist", "webview-chat", "browser", "main.js"]);

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" href="${stylesUri}">
          <title>Orasis</title>
        </head>
        <body>
          <div id="root"></div>
          <script>const vscode = acquireVsCodeApi();</script>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }
}
