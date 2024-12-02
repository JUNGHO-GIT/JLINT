// Main.ts

import * as fs from "fs";
import { getContents } from '../contents/Contents.js';
import { getCommon, getSyntax, getLanguage, getLogic } from '../core/Controller.js';

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

  let initContents = getContents(filePath);
  let finalContents = "";

  finalContents = await getCommon(confParam, initContents, fileExt);
  finalContents = await getLanguage(confParam, finalContents, fileName, fileExt);
  finalContents = await getSyntax(confParam, finalContents);
  finalContents = await getLogic(confParam, finalContents);

  fs.writeFileSync(filePath, finalContents, 'utf8');
};