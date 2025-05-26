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
  fileExt: string
) => {

  console.log(
  `_____________________
    ActivateLint: ${confParam.ActivateLint}
    RemoveComments: ${confParam.RemoveComments}
    InsertLine: ${confParam.InsertLine}
    fileName: ${fileName}
    fileExt: ${fileExt}`
  );

  let finalContents = await getContents(filePath);
  finalContents = await getLanguage(confParam, finalContents, fileName, fileExt);
  finalContents = await getSyntax(confParam, finalContents, fileExt);
  finalContents = await getLogic(confParam, finalContents, fileExt);

  fs.writeFileSync(filePath, finalContents, 'utf8');
};