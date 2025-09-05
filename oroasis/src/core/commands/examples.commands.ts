import { OutputChannel, window } from "vscode";

// Examples
export const helloWorldCommand = (outputChannel: OutputChannel) => {
    outputChannel.appendLine('Hello World from Orasis!');
    window.showInformationMessage('Hello World from Orasis!');
};