import * as vscode from "vscode";
import Controller from "./core/Controller";

export function activate (context: vscode.ExtensionContext)  {

  const controller = new Controller();
  context.subscriptions.push (
    vscode.commands.registerCommand("extension.JLINT", () =>  {
      controller.main();
    })
  );
}