interface Lang {

  data(): string[] | Error;
  find(): string | Error;
  update(): string | Error;
  outPut(): void;
}

export {Lang};