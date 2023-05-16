"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const vscode = require("vscode");
const parser_1 = require("./parser");

// ------------------------------------------------------------------------------------------------>
function activate (context)  {
  let activeEditor;
  let parser = new parser_1.Parser();
  let removeComments = function  (n)  {
    if (!activeEditor || !parser.supportedLanguage) {
      return ;
    }
    if (n === 0) {
      parser.FindSingleLineComments(activeEditor);
    }
    else if (n === 1) {
      parser.FindMultilineComments(activeEditor);
    }
    else {
      parser.FindSingleLineComments(activeEditor);
      parser.FindMultilineComments(activeEditor);
    }
    vscode.workspace.applyEdit(parser.edit);
  };
  let removeAllCommentsCommand = vscode.commands.registerCommand("extension.removeAllComments", () => {
    if (vscode.window.activeTextEditor) {
      activeEditor = vscode.window.activeTextEditor;
      parser.SetRegex(activeEditor, activeEditor.document.languageId);
      removeComments(2);
    }
  });
  let removeSingleLineCommentsCommand = vscode.commands.registerCommand("extension.removeSingleLineComments", () => {
    if (vscode.window.activeTextEditor) {
      activeEditor = vscode.window.activeTextEditor;
      parser.SetRegex(activeEditor, activeEditor.document.languageId);
      removeComments(0);
    }
  });
  let removeMultilineCommentsCommand = vscode.commands.registerCommand("extension.removeMultilineComments", () => {
    if (vscode.window.activeTextEditor) {
      activeEditor = vscode.window.activeTextEditor;
      parser.SetRegex(activeEditor, activeEditor.document.languageId);
      removeComments(1);
    }
  });
  context.subscriptions.push(removeAllCommentsCommand);
  context.subscriptions.push(removeSingleLineCommentsCommand);
  context.subscriptions.push(removeMultilineCommentsCommand);
}
exports.activate = activate;

// ------------------------------------------------------------------------------------------------>
function deactivate ()  {}
exports.deactivate = deactivate;
