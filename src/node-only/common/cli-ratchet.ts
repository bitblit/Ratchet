export class CliRatchet {
  public static isCalledFromCLI(filenames: string[]): boolean {
    let rval: boolean = false;
    for (let i = 0; filenames && i < filenames.length && !rval; i++) {
      rval = CliRatchet.indexOfCommandArgument(filenames[i]) > -1;
    }
    return rval;
  }

  public static argsAfterCommand(filenames: string[]): string[] {
    let rval: string[] = null;
    if (process?.argv?.length) {
      let idx: number = null;
      for (let i = 0; filenames && i < filenames.length && !idx; i++) {
        idx = CliRatchet.indexOfCommandArgument(filenames[i]);
      }
      rval = idx !== null ? process.argv.slice(idx, process.argv.length) : null;
    }

    return rval;
  }

  public static isCalledFromCLISingle(filename: string): boolean {
    return CliRatchet.isCalledFromCLI([filename]);
  }

  public static indexOfCommandArgument(filename: string): number {
    const contFileName: boolean[] = process.argv.map((arg) => arg.indexOf(filename) !== -1);
    return contFileName.indexOf(true);
  }
}
