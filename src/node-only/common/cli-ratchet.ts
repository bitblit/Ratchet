export class CliRatchet {
  public static isCalledFromCLI(filename: string): boolean {
    const xx = process.argv;
    return !!process.argv.find((arg) => arg.indexOf(filename) !== -1);
  }
}
