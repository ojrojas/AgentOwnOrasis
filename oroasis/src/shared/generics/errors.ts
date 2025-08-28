import { OutputChannel } from 'vscode';

export function handleError(error: any, outputChannel: OutputChannel, msg: string) {
    outputChannel.appendLine(`${msg}: ${error}`);
}