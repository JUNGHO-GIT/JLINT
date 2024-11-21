// extension.ts

import path from "path";
import vscode from "vscode";
import { main } from "./core/Main.js";

// -------------------------------------------------------------------------------------------------
const activate = (context: vscode.ExtensionContext) => {

  // 1. Get Configuration
  const config = vscode.workspace.getConfiguration("JLINT");

  // 2. Output
  console.log(`"JLINT" is now active!`);

  // 3. Register Command
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.JLINT", async () => {

      const editor = vscode.window.activeTextEditor;
      const filePath = editor.document.uri.fsPath;
      const fileExt = editor.document.languageId;
      const fileName = path.basename(filePath);

      const confParam = {
        ActivateLint: config.get<boolean>("ActivateLint") || false,
        RemoveComments: config.get<boolean>("RemoveComments") || false,
        InsertLine: config.get<boolean>("InsertLine") || false
      };

      console.log(`--------------------`);
      console.log(`fileName: ('${fileName}')`);
      console.log(`ActivateLint: ('${confParam.ActivateLint}')`);
      console.log(`RemoveComments: ('${confParam.RemoveComments}')`);
      console.log(`InsertLine: ('${confParam.InsertLine}')`);

      await main(confParam, filePath, fileName, fileExt);
    })
  );
};

export { activate };