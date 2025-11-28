// Main.ts

import { fs } from "@exportLibs";
import { getContents, getLanguage, getSyntax, getLogic } from "@exportCores";
import { logger } from "@exportScripts";
import { CommonType } from "@exportTypes";

// -------------------------------------------------------------------------------------------------
export const main = async (
  commonParam: CommonType,
  filePath: string,
  fileName: string,
  fileTabSize: number,
  fileEol: string,
  fileExt: string,
) => {
  logger(
    "info",
    `activateLint: ${commonParam.activateLint}\nremoveComments: ${commonParam.removeComments}\ninsertLine: ${commonParam.insertLine}\ntabSize: ${commonParam.tabSize}\nquoteType: ${commonParam.quoteType}\nfileName: ${fileName}\nfileExt: ${fileExt}\nfileTabSize: ${fileTabSize}\nfileEol: ${fileEol}`
  );

  let finalContents = await getContents(filePath, fileTabSize, fileEol, fileExt);
  finalContents = await getLanguage(commonParam, finalContents, fileName, fileTabSize, fileEol, fileExt);
  finalContents = await getSyntax(commonParam, finalContents, fileExt);
  finalContents = await getLogic(commonParam, finalContents, fileExt);

  fs.writeFileSync(filePath, finalContents, 'utf8');
};