export class CliRatchet {
  public static isCalledFromCLI(filename: string): boolean {
    return process.argv[1].indexOf(filename) !== -1;
  }
}
