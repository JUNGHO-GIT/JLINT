import Controller from "../utils/Controller";

class Main {

  public main() {

    return new Controller().components()
    + new Controller().lang()
    + new Controller().common()
    + new Controller().syntex()
    + new Controller().special();
  }
}

new Main().main();