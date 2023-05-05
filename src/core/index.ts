import ReadFile from "../components/Read";
import RecognizeFile from "../components/Recognize";
import CopyFile from "../components/Copy";
import Controller from "../utils/Controller";

class Main {

  public read() {
    const read = new ReadFile();
    const readFile = read.outPut();

    return readFile;
  }

  public recognize() {
    const recognize = new RecognizeFile();
    const recognizeFile = recognize.outPut();

    return recognizeFile;
  }

  public controller() {
    const controller = new Controller();

    return controller;
  }

  public copy() {
    const copy = new CopyFile();
    const copyFile = copy.outPut();

    return copyFile;
  }

  public main() {

    this.read();
    this.recognize();
    this.controller();
    this.copy();
  }
}

const main = new Main();
main.main();
