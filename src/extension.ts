// extensions.ts

import * as vscode from "vscode";
import Main from "./core/Main";

// -------------------------------------------------------------------------------------------------
const activate = (context: vscode.ExtensionContext) => {

  // 0. check if the extension is activated
  console.log(`"JLINT" is now active!`);

  // 1. access configuration parameters
  const config = vscode.workspace.getConfiguration("JLINT");

  // 0. configuration Parameters
  const confParam = {
    ActivateLint: false,
    RemoveComments: false,
    InsertLine: false
  };

  Object.assign(confParam, {
    ActivateLint: config.get("ActivateLint") === true ? true : false,
    RemoveComments: config.get("RemoveComments") === true ? true : false,
    InsertLine: config.get("InsertLine") === true ? true : false
  });

  // 4. register command
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.JLINT", () =>  {
      const main = new Main();
      main.main(confParam);
    })
  );
};

export { activate };
