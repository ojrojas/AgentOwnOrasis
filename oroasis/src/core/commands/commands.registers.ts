import { window } from 'vscode';

export const helloWorldCommand = (): void => {
    window.showInformationMessage('Hello World from Orasis!');
}