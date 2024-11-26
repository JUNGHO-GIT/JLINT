// extension.ts

import * as path from "path";
import * as vscode from "vscode";
import { main } from "./core/Main.js";

// -------------------------------------------------------------------------------------------------
export const activate = (context: vscode.ExtensionContext) => {

  // 1. Get Configuration
  const config = vscode.workspace.getConfiguration("JLINT");

  // 2. Output
  console.log(`"JLINT" is now active!`);

  // 3. Register Command
  try {
    context.subscriptions.push(
      vscode.commands.registerCommand("extension.JLINT", async () => {
        const editor = vscode.window.activeTextEditor;
        const filePath = editor.document.uri.fsPath;
        const fileExt = editor.document.languageId;
        const fileName = path.basename(filePath);

        const confParam = {
          ActivateLint: config.get("ActivateLint") as boolean || false,
          RemoveComments: config.get("RemoveComments") as boolean || false,
          InsertLine: config.get("InsertLine") as boolean || false
        };
        await main(confParam, filePath, fileName, fileExt);
      }
    ));
  }
  catch (err: any) {
    console.error(err.message);
  }
};
