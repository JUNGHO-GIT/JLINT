import Controller from './Controller';

class Main {
  public main() {
    const controllerInstance = new Controller();
    controllerInstance.components();
    controllerInstance.lang();
    controllerInstance.syntax();
    controllerInstance.extra();
  }
}
new Main().main();
export default Main;
