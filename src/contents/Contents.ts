// Contents.ts

import * as fs from "fs";
import * as path from "path";

// -------------------------------------------------------------------------------------------------
export const getContents = (filePath: string) => {
  const data = fs.readFileSync(filePath, "utf8");
  const fileName = path.basename(filePath);
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

    console.log(`_____________________\n getContents Activated! ('${fileName}')`);
    return updateContent;
  }
  catch (err: any) {
    console.error(err);
    return data;
  }
};