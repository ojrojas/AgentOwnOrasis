import { Uri, Webview } from "vscode";
import path from "path";

export function getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
	return webview.asWebviewUri(Uri.file(path.join(extensionUri.fsPath, ...pathList)));
}