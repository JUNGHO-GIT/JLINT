// Contents.ts

import * as vscode from "vscode";

// -------------------------------------------------------------------------------------------------
export const getContents = async (filePath: string) => {

  const decoder = new TextDecoder("utf-8");
  const data = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
  const dataStr = decoder.decode(data);

  try {
    const updateContent = dataStr.split("\n").map((line: string) => {
      const indentMatch = line.match(/^(\s+)/);
      if (indentMatch) {
        const spaces = indentMatch[1].length;
        const newIndent = Math.ceil(spaces / 2) * 2;
        return line.replace(/^(\s+)/, " ".repeat(newIndent));
      }
      return line;
    })
    .join("\n")
    .trim();

    return updateContent;
  }
  catch (err: any) {
    console.error(err);
    return dataStr;
  }
};