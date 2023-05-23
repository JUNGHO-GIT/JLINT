import vscode from "vscode";
import Main from "./core/index";

export function activate (context: vscode.ExtensionContext)  {
  context.subscriptions.push (
    vscode.commands.registerCommand("extension.JLINT", () =>  {
      new Main().main();
    }
  ));
};