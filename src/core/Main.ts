// Main.ts

import * as fs from "fs";
import { getContents } from '../contents/Contents';
import { getLanguage, getSyntax, getLogic } from '../core/Controller';

// -------------------------------------------------------------------------------------------------
declare type ConfProps = {
  ActivateLint: boolean,
  RemoveComments: boolean,
  InsertLine: boolean
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
    ActivateLint: ${confParam.ActivateLint}
    RemoveComments: ${confParam.RemoveComments}
    InsertLine: ${confParam.InsertLine}
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