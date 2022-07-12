export class CliRatchet {
  public static isCalledFromCLI(filename: string): boolean {
    return CliRatchet.indexOfCommandArgument(filename) > -1;
  }

  public static indexOfCommandArgument(filename: string): number {
    const contFileName: boolean[] = process.argv.map((arg) => arg.indexOf(filename) !== -1);
    return contFileName.indexOf(true);
  }
}
