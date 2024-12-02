// Contents.ts

import * as fs from "fs";

// -------------------------------------------------------------------------------------------------
export const getContents = (filePath: string) => {

  const data = fs.readFileSync(filePath, "utf8");

  try {
    const updateContent = data.split("\n").map((line: string) => {
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
    return data;
  }
};