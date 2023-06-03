import Controller from './Controller';

class Main {
  public main(paramArray: string[]) {
    const controller = new Controller();

    controller.common(paramArray)
    + controller.lang(paramArray)
    + controller.syntax(paramArray)
    + controller.logic(paramArray)
    + controller.extra(paramArray);
  }
}

export default Main;

