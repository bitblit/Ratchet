/*
    Takes in a list of static files, and a class name, and generates a static
    class containing each of the files in a map.  This is to allow static
    content to be passed through webpack safely
 */

import { Logger } from '../../common/logger.js';
import fs from 'fs';
import { CliRatchet } from './cli-ratchet.js';

export class FilesToStaticClass {
  public static async process(fileNames: string[], outClassName: string, outFileName: string = null): Promise<string> {
    if (!fileNames) {
      throw new Error('fileNames must be defined');
    }
    if (!outClassName) {
      throw new Error('outClassName must be defined');
    }
    if (fileNames.length === 0) {
      Logger.warn('Warning - no files supplied to process');
    }

    Logger.info('Generating class %s from files %j (output file: %s)', outClassName, fileNames, outFileName);

    let rval = '/** \n';
    rval += '* Holder for the constants to be used by consumers \n';
    rval += '* Moves it into code so that it can survive a trip through WebPack \n';
    rval += '*/ \n\n';
    rval += 'export class ' + outClassName + ' { \n';
    rval += '  public static readonly VALUES:any = { \n';

    for (let i = 0; i < fileNames.length; i++) {
      let contents = 'NOT-FOUND';
      if (fs.existsSync(fileNames[i])) {
        const trimmed: string = fileNames[i].substring(fileNames[i].lastIndexOf('/') + 1);
        contents = fs.readFileSync(fileNames[i]).toString();
        rval += i > 0 ? ',' : '';
        rval += '"' + trimmed + '":' + JSON.stringify(contents) + '\n';
      } else {
        Logger.warn('Could not find file %s', fileNames[i]);
      }
    }

    rval += '}; \n';
    rval += '}';

    if (!!outFileName) {
      Logger.info('Writing to %s', outFileName);
      fs.writeFileSync(outFileName, rval);
    }

    return rval;
  }
}

if (CliRatchet.isCalledFromCLI('files-to-static-class')) {
  if (process.argv.length < 4) {
    console.log('Usage: files-to-static-class {outFileName} {outClassName} {file0} ... {fileN}');
  } else {
    const idx: number = CliRatchet.indexOfCommandArgument('files-to-static-class');
    const outFileName: string = process.argv[idx + 1];
    const outClassName: string = process.argv[idx + 2];
    const files: string[] = process.argv.slice(idx + 3);

    Logger.info(
      'Running FilesToStaticClass from command line arguments Target: %s TargetClass: %s InFiles: %j',
      outFileName,
      outClassName,
      files
    );

    FilesToStaticClass.process(files, outClassName, outFileName)
      .then((res) => {
        // For the moment, do nothing
      })
      .catch((err) => {
        Logger.error('Error processing : %s', err, err);
      });
  }
}
