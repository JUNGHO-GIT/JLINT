import ReadTitle from "../components/ReadTitle";
import Copy from "../components/Copy";
import ReadContents from "../components/ReadContents";
import Recognize from "../components/Recognize";
import Controller from "../utils/Controller";

class Main {

  public readTitle() {
    return new ReadTitle().output();
  }

  public copy() {
    return new Copy().output();
  }

  public readContents() {
    return new ReadContents().output();
  }

  public recognize() {
    return new Recognize().output();
  }

  public controller() {
    return new Controller().output();
  }

  public async main() {
    this.readTitle();
    this.copy();
    this.readContents();
    this.recognize();
    this.controller();
  }
}

const main = new Main();
main.main();
