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

  let initContents = getContents(filePath);
  let finalContents = "";

  finalContents = await getCommon(confParam, initContents, fileName, fileExt);
  finalContents = await getLanguage(confParam, finalContents, fileName, fileExt);
  finalContents = await getSyntax(confParam, finalContents, fileName);
  finalContents = await getLogic(confParam, finalContents, fileName);

  fs.writeFileSync(filePath, finalContents, 'utf8');
};