import * as vscode from "vscode";
import Main from "./core/index";

export const activate = (context: vscode.ExtensionContext) => {

  const configuration = () => {

    let paramArray: string[] = [];

    // access configuration parameters
    const config = vscode.workspace.getConfiguration ("JLINT");

    // settings parameters
    const removeComments = config.get ("RemoveComments");
    const insertLine = config.get ("InsertLine");

    if (removeComments === false) {
      paramArray.push ("RemoveComments");
    }
    if (insertLine === false) {
      paramArray.push ("InsertLine");
    }

    context.subscriptions.push (
      vscode.commands.registerCommand("extension.JLINT", () =>  {
        new Main().main(paramArray);
      })
    );
  };
  configuration();
};