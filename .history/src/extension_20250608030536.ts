// extension.ts

import * as path from "path";
import * as vscode from "vscode";
import { main } from "./core/Main.js";

// -------------------------------------------------------------------------------------------------
export const activate = (context: vscode.ExtensionContext) => {
  try {
    // 1. Output
    console.log(`_____________________\n JLint Activated!`);

    // 2. Get Configuration
    const getConfiguration = () => {
      const config = vscode.workspace.getConfiguration("JLINT");
      return {
        ActivateLint: config.get("ActivateLint") as boolean,
        RemoveComments: config.get("RemoveComments") as boolean,
        InsertLine: config.get("InsertLine") as boolean
      };
    };

    // 3. Register Command
    const command = vscode.commands.registerCommand("extension.JLINT", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found!");
        return;
      }

      const filePath = editor.document.uri.fsPath;
      const fileExt = editor.document.languageId;
      const fileName = path.basename(filePath);
      const fileTabSize = parseInt(editor.options.tabSize as string);
      const fileEol = String(editor.document.eol === 1 ? "\n" : "\r\n");

      await main(getConfiguration(), filePath, fileName, fileExt, fileTabSize, fileEol);
    });
    context.subscriptions.push(command);

    // 4. Listen for configuration changes
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("JLINT")) {
          console.log(`_____________________\n JLINT configuration updated : ${JSON.stringify(getConfiguration(), null, 2)}`);
        }
      })
    );
  }
  catch (err: any) {
    console.error(err.message);
  }
};