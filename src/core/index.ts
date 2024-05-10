// index.ts

import Controller from './Controller';

class Main {

  // 1. common ------------------------------------------------------------------------------------>
  public main(paramArray: string[]) {

    console.log("_____________________\n" + "main 실행");

    const controller = new Controller();

    controller.common(paramArray)
    + controller.lang(paramArray)
    + controller.syntax(paramArray)
    + controller.logic(paramArray)
    + controller.extra(paramArray);
  }
}

export default Main;