// Main.ts

import * as fs from "fs";
import { getContents } from "./Contents";
import { getLanguage, getSyntax, getLogic } from "./Controller";

// -------------------------------------------------------------------------------------------------
declare type ConfProps = {
  activateLint: boolean,
  removeComments: boolean,
  insertLine: boolean,
  tabSize: number,
  quoteType: string
};

// -------------------------------------------------------------------------------------------------
export const main = async (
  confParam: ConfProps,
  filePath: string,
  fileName: string,
  fileTabSize: number,
  fileEol: string,
  fileExt: string,
) => {

  console.log(
    `_____________________
    activateLint: ${confParam.activateLint}
    removeComments: ${confParam.removeComments}
    insertLine: ${confParam.insertLine}
    tabSize: ${confParam.tabSize}
    quoteType: ${confParam.quoteType}
    fileName: ${fileName}
    fileExt: ${fileExt}
    fileTabSize: ${fileTabSize}
    fileEol: ${fileEol}`
  );

  let finalContents = await getContents(filePath, fileTabSize, fileEol, fileExt);
  finalContents = await getLanguage(confParam, finalContents, fileName, fileTabSize, fileEol, fileExt);
  finalContents = await getSyntax(confParam, finalContents, fileExt);
  finalContents = await getLogic(confParam, finalContents, fileExt);

  fs.writeFileSync(filePath, finalContents, 'utf8');
};