// extensions.ts

import vscode from "vscode";
import Main from "./core/index";

const activate = (context: vscode.ExtensionContext) => {

  let paramArray: string[] = [];

  // access configuration parameters
  const config = vscode.workspace.getConfiguration("JLINT");

  // settings parameters
  const removeComments = config.get("RemoveComments") as boolean;
  const insertLine = config.get("InsertLine") as boolean;

  // push parameters to array
  if (removeComments === true) {
    paramArray.push("RemoveComments");
  }
  if (insertLine === true) {
    paramArray.push("InsertLine");
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.JLINT", () =>  {
      console.log("JLINT: Command activated");
      new Main().main(paramArray);
    })
  );
};

export { activate };
