import { commands, OutputChannel, window } from 'vscode';

export const createCommand = (commandName: string, callback: (parameter: any) => void) => {
    return commands.registerCommand(commandName, callback);
};

// Examples
export const helloWorldCommand = (outputChannel: OutputChannel) => {
    window.showInformationMessage('Hello World from Orasis!');
};
