// Contents.ts

import * as vscode from "vscode";

// -------------------------------------------------------------------------------------------------
export const getContents = async (
  filePath: string,
  fileTabSize: number,
  fileEol: string
) => {

  const decoder = new TextDecoder("utf-8");
  const data = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
  const dataStr = decoder.decode(data);

  try {
    const lines = dataStr.split(fileEol === "lf" ? "\n" : "\r\n");

    const processedLines = lines
    .map(line => line.trimEnd())
    .filter((line, idx, arr) => !(line === "" && (arr[idx - 1] ?? "") === ""))
    .map(line => {
      const match = line.match(/^(\s+)/);
      if (match) {
        const spaceLen = match[1].length;
        const newLen = Math.ceil(spaceLen / fileTabSize) * fileTabSize;
        return " ".repeat(newLen) + line.trimStart();
      }
      return line;
    });

    const updateContent = processedLines.join("\n").trim();

    console.log(`_____________________\n 'getContents' Activated!`);
    return updateContent;
  }
  catch (err: any) {
    console.error(err);
    return dataStr;
  }
};