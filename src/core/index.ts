import Controller from './Controller';

class Main {
  public main() {
    new Controller().common()
    + new Controller().lang()
    + new Controller().components()
    + new Controller().syntax()
    + new Controller().extra();
  }
}
export default Main;

