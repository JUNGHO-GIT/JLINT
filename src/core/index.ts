import Controller from "./Controller";

class Main {
  public main() {
    return new Controller().common()
    + new Controller().lang()
    + new Controller().components()
    + new Controller().syntax()
    + new Controller().extra();
  }
}
new Main().main();