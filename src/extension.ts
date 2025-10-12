// extension.ts

import "tsconfig-paths/register";
import * as path from "path";
import * as vscode from "vscode";
import { main } from "./core/Main";

// -------------------------------------------------------------------------------------------------
export const deactivate = () => {};
export const activate = (context: vscode.ExtensionContext) => {

    // 1. Get Configuration ------------------------------------------------------------------------
    const getConfiguration = () => {
      const config = vscode.workspace.getConfiguration("Jlint");
      return {
        ActivateLint: config.get("ActivateLint", true) as boolean,
        RemoveComments: config.get("RemoveComments", true) as boolean,
        InsertLine: config.get("InsertLine", true) as boolean
      };
    };

    // 2. Register Command ---------------------------------------------------------------------------
    const command = vscode.commands.registerCommand("extension.Jlint", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found!");
        return;
      }

      const filePath = editor.document.uri.fsPath;
      const fileName = path.basename(filePath);
      const fileTabSize = parseInt(editor.options.tabSize as string);
      const fileEol = String(editor.document.eol === 1 ? "lf" : "crlf");
      const fileExt = editor.document.languageId;

      await main(
        getConfiguration(),
        filePath,
        fileName,
        fileTabSize,
        fileEol,
        fileExt,
      );
    });
    context.subscriptions.push(command);

    // 3. Listen for configuration changes -----------------------------------------------------------
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((event) => {
        event.affectsConfiguration("Jlint") && console.log(`_____________________\n Jlint configuration updated : ${JSON.stringify(getConfiguration(), null, 2)}`);
      })
    );
};