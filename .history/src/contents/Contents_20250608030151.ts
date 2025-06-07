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
    const updateContent = dataStr
    // .split("\n")
    .split(fileEol === "\r\n" ? /\r?\n/ : fileEol)
    // 우측 공백 제거
    .map((line: string) => line.trimEnd())
    // 빈 줄 제거 + 연속 빈 줄 방지
    .filter((line: string, idx, arr) => {
      const prev = arr[idx - 1] || "";
      return !(line === "" && prev === "");
    })
    .map((line: string) => {
      const indentMatch = line.match(/^(\s+)/);
      if (indentMatch) {
        const spaces = indentMatch[1].length;
        const newIndent = Math.ceil(spaces / fileTabSize) * fileTabSize;
        return line.replace(/^(\s+)/, " ".repeat(newIndent));
      }
      return line;
    })
    .join("\n")
    .trim();

    console.log(`_____________________\n 'getContents' Activated!`);
    return updateContent;
  }
  catch (err: any) {
    console.error(err);
    return dataStr;
  }
};