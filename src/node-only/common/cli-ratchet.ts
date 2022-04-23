export class CliRatchet {
  public static isCalledFromCLI(filename: string): boolean {
    return !!process.argv.find((arg) => arg.indexOf(filename) !== -1);
  }
}
