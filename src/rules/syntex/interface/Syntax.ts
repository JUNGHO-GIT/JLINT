interface Syntax {
  data(): string | Error;
  main(): string | Error;
  output(): void;
}
export {Syntax};