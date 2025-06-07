// Main.ts

import * as fs from "fs";
import { getContents } from '../contents/Contents.js';
import { getLanguage, getSyntax, getLogic } from '../core/Controller.js';

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
  fileExt: string,
  fileTabSize: number
) => {

  console.log(
    `_____________________
    ActivateLint: ${confParam.ActivateLint}
    RemoveComments: ${confParam.RemoveComments}
    InsertLine: ${confParam.InsertLine}
    fileName: ${fileName}
    fileExt: ${fileExt}
    fileTabSize: ${fileTabSize}`
  );

  let finalContents = await getContents(filePath, fileTabSize);
  finalContents = await getLanguage(confParam, finalContents, fileName, fileExt, fileTabSize);
  finalContents = await getSyntax(confParam, finalContents, fileExt, fileTabSize);
  finalContents = await getLogic(confParam, finalContents, fileExt, fileTabSize);

  fs.writeFileSync(filePath, finalContents, 'utf8');
};