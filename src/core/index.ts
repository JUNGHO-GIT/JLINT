import Controller from "../utils/Controller";

class Main {

  public main() {

    const controller = new Controller();

    const components = controller.components();
    const lang = controller.lang();
    const common = controller.common();
    const special = controller.special();
    const syntex = controller.syntex();

    return components + lang + common + special + syntex;
  }
}

new Main().main();