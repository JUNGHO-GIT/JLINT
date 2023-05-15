import Controller from './Controller';

class Main {
  public main() {
    new Controller().components()
    + new Controller().lang()
    + new Controller().syntax()
    + new Controller().extra();
  }
}
new Main().main();
export default Main;