// Main.ts

import Controller from './Controller';

// -------------------------------------------------------------------------------------------------
declare type ConfProps = {
  ActivateLint: boolean,
  RemoveComments: boolean,
  InsertLine: boolean
};

// -------------------------------------------------------------------------------------------------
class Main {

  // 1. common -------------------------------------------------------------------------------------
  public async main(confParam: ConfProps) {

    console.log(`--------------------`);
    console.log(`ActivateLint: '${confParam.ActivateLint}'`);
    console.log(`RemoveComments: '${confParam.RemoveComments}'`);
    console.log(`InsertLine: '${confParam.InsertLine}'`);

    const controller = new Controller();
    const common = controller.common(confParam);
    const lang = controller.lang(confParam);
    const syntax = controller.syntax(confParam);
    const logic = controller.logic(confParam);
    const extra = controller.extra(confParam);

    return common + lang + syntax + logic + extra;
  };
};

export default Main;