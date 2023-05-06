import ReadTitle from "../components/ReadTitle";
import Copy from "../components/Copy";
import ReadContents from "../components/ReadContents";
import Recognize from "../components/Recognize";
import Controller from "../rules/utils/Controller";

class Main {

  public readTitle() {
    const read = new ReadTitle();
    const readFile = read.outPut();

    return readFile;
  }

  public copy() {
    const copy = new Copy();
    const copyFile = copy.outPut();

    return copyFile;
  }

  public readContents() {
    const read = new ReadContents();
    const readFile = read.outPut();

    return readFile;
  }

  public recognize() {
    const recognize = new Recognize();
    const recognizeFile = recognize.outPut();

    return recognizeFile;
  }

  public controller() {
    const controller = new Controller();
    const controllerOutput = controller.outPut();

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
