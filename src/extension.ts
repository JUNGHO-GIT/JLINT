import vscode from "vscode";
import Main from "./core/index";
import * as path from "path";

const activate = (context: vscode.ExtensionContext) => {

  let paramArray: string[] = [];

  // access configuration parameters
  const config = vscode.workspace.getConfiguration("JLINT");

  // settings parameters
  const RainbowBrackets = config.get("RainbowTags") as boolean;
  const removeComments = config.get("RemoveComments") as boolean;
  const insertLine = config.get("InsertLine") as boolean;

  // push parameters to array
  if (RainbowBrackets === true) {
    paramArray.push("RainbowTags");
  }
  if (removeComments === true) {
    paramArray.push("RemoveComments");
  }
  if (insertLine === true) {
    paramArray.push("InsertLine");
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.JLINT", () =>  {
      new Main().main(paramArray);
    })
  );

  vscode.workspace?.onDidOpenTextDocument((e: vscode.TextDocument) => {
    const fileName = path.basename(e.fileName);
    const languageName = e.languageId;
    console.log("JLINT: Document opened: " + fileName);
    console.log("JLINT: Detected Language: " + languageName);
    console.log("JLINT: paramArray: " + JSON.stringify(paramArray, null, 2));
  });
};

export { activate };
