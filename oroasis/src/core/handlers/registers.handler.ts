import { commands } from 'vscode';

export const createCommand = (commandName: string, callback: (parameter: any) => void) => {
    return commands.registerCommand(commandName, callback);
};
