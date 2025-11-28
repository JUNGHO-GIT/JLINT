// extension.ts

import { main } from "@exportCores";
import { path, vscode, setExtensionPath } from "@exportLibs";
import { logger, initLogger, notify } from "@exportScripts";

// -------------------------------------------------------------------------------------------------
export const deactivate = () => {};
export const activate = (context: vscode.ExtensionContext) => {

		// 0. Initialize Logger ------------------------------------------------------------------------
		initLogger();
		setExtensionPath(context.extensionPath);
    logger("info", "activation - Jlint is now active!");

    // 1. Get Configuration ------------------------------------------------------------------------
    const getConfiguration = () => {
      const config = vscode.workspace.getConfiguration("Jlint");
      return {
        activateLint: config.get("activateLint", true) as boolean,
        removeComments: config.get("removeComments", true) as boolean,
        insertLine: config.get("insertLine", true) as boolean,
        tabSize: config.get("tabSize", 2) as number,
        quoteType: config.get("quoteType", "double") as string
      };
    };

    // 2. Register Command ---------------------------------------------------------------------------
    const command = vscode.commands.registerCommand("extension.Jlint", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        notify("error", "Jlint - No active editor found.");
        return;
      }

      if (editor.document.uri.scheme !== 'file') {
        notify("error", "Jlint - Please save the file before linting.");
        return;
      }

      const filePath = editor.document.uri.fsPath;
      const fileName = path.basename(filePath);
      const fileTabSize = getConfiguration().tabSize;
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

      notify("info", `Linting Completed - "${fileName}"`);
    });

    // 3. Listen for configuration changes -----------------------------------------------------------
    context.subscriptions.push(command);
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
        if (event.affectsConfiguration("Jlint")) {
          logger("info", `configuration - updated: ${JSON.stringify(getConfiguration(), null, 2)}`);
        }
      })
    );
};