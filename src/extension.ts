import vscode from "vscode";
import Main from "./core/index";

export function activate (context: vscode.ExtensionContext)  {

  const main = new Main();
  context.subscriptions.push (
    vscode.commands.registerCommand("extension.JLINT", () =>  {
      main.main();
    }
  ));
}