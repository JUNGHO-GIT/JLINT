interface Rules {

  data(): string | Error;
  main(): string | Error;
  outPut(): void;
}

export {Rules};