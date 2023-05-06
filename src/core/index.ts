import ReadTitle from "../components/ReadTitle";
import Copy from "../components/Copy";
import ReadContents from "../components/ReadContents";
import Recognize from "../components/Recognize";
import Controller from "../rules/utils/Controller";

class Main {

  public readTitle() {
    const read = new ReadTitle();
    const readFile = read.output();

    return readFile;
  }

  public copy() {
    const copy = new Copy();
    const copyFile = copy.output();

    return copyFile;
  }

  public readContents() {
    const read = new ReadContents();
    const readFile = read.output();

    return readFile;
  }

  public recognize() {
    const recognize = new Recognize();
    const recognizeFile = recognize.output();

    return recognizeFile;
  }

  public controller() {
    const controller = new Controller();
    const controllerOutput = controller.output();

    return controllerOutput;
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
