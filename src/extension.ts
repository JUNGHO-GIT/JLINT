import * as vscode from 'vscode';
import Controller from './core/Controller';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('JLINT', () => {
      Jlint();
    })
  );
}

export function Jlint() {
  const mainInstance = new Controller().main();
  console.log(mainInstance);
}

export function deactivate() {}