import * as vscode from 'vscode';
import { createCommand } from '../../core/handlers/registers.handler';

export function registerCommands(
  commands: { id: string; handler: (...args: any[]) => any }[],
  addSubscriber: (item: vscode.Disposable) => void
) {
  commands.forEach(({ id, handler }) => addSubscriber(createCommand(id, handler)));
}

export function registerProvidersAndControllers(
  providers: vscode.Disposable[],
  addSubscriber: (item: vscode.Disposable) => void
) {
  providers.forEach(addSubscriber);
}
