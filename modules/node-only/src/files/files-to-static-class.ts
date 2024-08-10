/*
    Takes in a list of static files, and a class name, and generates a static
    class containing each of the files in a map.  This is to allow static
    content to be passed through webpack safely
 */

import fs, { Stats } from 'fs';
import path from 'path';
import { CliRatchet } from '../cli/cli-ratchet.js';
import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { RequireRatchet } from "@bitblit/ratchet-common/lang/require-ratchet";

export class FilesToStaticClass {
  public static async process(inFileNames: string[], outClassName: string, outFileName: string = null): Promise<string> {
    if (!inFileNames) {
      throw new Error('fileNames must be defined');
    }
    if (!outClassName) {
      throw new Error('outClassName must be defined');
    }
    if (inFileNames.length === 0) {
      Logger.warn('Warning - no files supplied to process');
    }

    // Preprocess to remove non-existent files and convert folders to files
    const fileNames: string[] = [];
    inFileNames.forEach((f) => FilesToStaticClass.processFilename(f, fileNames));

    Logger.info('Generating class %s from files %j (output file: %s)', outClassName, fileNames, outFileName);

    let rval = '/** \n';
    rval += '* Holder for the constants to be used by consumers \n';
    rval += '* Moves it into code so that it can survive a trip through WebPack \n';
    rval += '*/ \n\n';
    rval += 'export class ' + outClassName + ' { \n';
    rval += '  public static readonly VALUES:Record<string, string> = { \n';

    // If we reached here we can assume all the files exist and are files
    for (let i = 0; i < fileNames.length; i++) {
      // Remove both forward and back slashes...
      let trimmed: string = fileNames[i].substring(fileNames[i].lastIndexOf('/') + 1);
      trimmed = trimmed.substring(trimmed.lastIndexOf('\\') + 1);
      const contents: string = fs.readFileSync(fileNames[i]).toString();
      rval += i > 0 ? ',' : '';
      rval += '"' + trimmed + '":' + JSON.stringify(contents) + '\n';
    }

    rval += '}; \n';
    rval += '}';

    if (outFileName) {
      Logger.info('Writing to %s', outFileName);
      fs.writeFileSync(outFileName, rval);
    }

    return rval;
  }

  private static processFilename(fileName: string, targetArrayInPlace: string[]): void {
    RequireRatchet.notNullOrUndefined(targetArrayInPlace, 'targetArrayInPlace');
    if (fs.existsSync(fileName)) {
      const stats: Stats = fs.statSync(fileName);
      if (stats.isDirectory()) {
        const contFiles: string[] = fs.readdirSync(fileName);
        Logger.info('Found %d files in %s to process', contFiles.length, fileName);
        contFiles.forEach((f) => FilesToStaticClass.processFilename(path.join(fileName, f), targetArrayInPlace));
      } else if (stats.isFile()) {
        targetArrayInPlace.push(fileName);
      } else {
        Logger.error('Skipping - neither file nor directory : %s', fileName);
      }
    } else {
      Logger.warn('Could not find file %s', fileName);
    }
  }

  /**
   And, in case you are running this command line...
   TODO: should use switches to allow setting the various non-filename params
   **/
  public static async runFromCliArgs(args: string[]): Promise<string> {
    if (args.length < 3) {
      Logger.infoP('Usage: ratchet-files-to-static-class {outFileName} {outClassName} {file0} ... {fileN}');
      return null;
    } else {
      const idx: number = CliRatchet.indexOfCommandArgument('files-to-static-class');
      const outFileName: string = process.argv[idx + 1];
      const outClassName: string = process.argv[idx + 2];
      const files: string[] = process.argv.slice(idx + 3);

      Logger.info(
        'Running FilesToStaticClass from command line arguments Target: %s TargetClass: %s InFiles: %j',
        outFileName,
        outClassName,
        files,
      );

      return FilesToStaticClass.process(files, outClassName, outFileName);
    }
  }
}
