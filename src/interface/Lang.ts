interface Lang {

  data(): string | Error;
  main(): string | Error;
  output(): void;
}

export {Lang};