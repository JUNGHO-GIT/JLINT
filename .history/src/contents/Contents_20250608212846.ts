// Contents.ts

import * as vscode from "vscode";

// -------------------------------------------------------------------------------------------------
export const getContents = async (
  filePath: string,
  fileTabSize: number,
  fileEol: string
) => {

  const data = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
  const decoder = new TextDecoder("utf-8");
  const dataStr = decoder.decode(data);

  const editor = vscode.window.activeTextEditor ? vscode.window.activeTextEditor : null;
  const selectedData = editor.document.getText(editor.selection);

  let finalData = "";
  if (selectedData !== "") {
    finalData += selectedData;
  }
  else {
    finalData += dataStr;
  }

  console.log("finalData", finalData);

  try {
    const updateContent = finalData
    // .split("\n")
    .split(fileEol === "lf" ? "\n" : "\r\n")
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