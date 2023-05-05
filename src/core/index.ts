import ReadFile from "../components/Read";
import RecognizeFile from "../components/Recognize";
import JsRules from "../lang/JsRules";
import CopyFile from "../components/Copy";

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

  public rules() {
    const jsRules = new JsRules();
    const jsFile = jsRules.outPut();

    return jsFile;
  }

  public copy() {
    const copy = new CopyFile();
    const copyFile = copy.outPut();

    return copyFile;
  }

  public main() {

    this.read();
    this.recognize();
    this.rules();
    this.copy();
  }
}

const main = new Main();
main.main();
