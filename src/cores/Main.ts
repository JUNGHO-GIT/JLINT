// Main.ts

import { fs } from "@exportLibs";
import { getContents, getLanguage, getSyntax, getLogic } from "@exportCores";
import { logger } from "@exportScripts";

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

  logger(
    "info",
    "main",
    `activateLint: ${confParam.activateLint}\nremoveComments: ${confParam.removeComments}\ninsertLine: ${confParam.insertLine}\ntabSize: ${confParam.tabSize}\nquoteType: ${confParam.quoteType}\nfileName: ${fileName}\nfileExt: ${fileExt}\nfileTabSize: ${fileTabSize}\nfileEol: ${fileEol}`
  );

  let finalContents = await getContents(filePath, fileTabSize, fileEol, fileExt);
  finalContents = await getLanguage(confParam, finalContents, fileName, fileTabSize, fileEol, fileExt);
  finalContents = await getSyntax(confParam, finalContents, fileExt);
  finalContents = await getLogic(confParam, finalContents, fileExt);

  fs.writeFileSync(filePath, finalContents, 'utf8');
};