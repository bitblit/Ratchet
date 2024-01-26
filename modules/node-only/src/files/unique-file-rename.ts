/*
    Given a folder name, it renames all the files within it to a roughly
    globally unique name (basically just timestamps) while retaining the
    extensions.  Mainly used to merge multiple folders that have files with the
    same names
 */

import { BooleanRatchet, Logger, StringRatchet } from '@bitblit/ratchet-common';
import fs, { Stats } from 'fs';
import path from 'path';
import { CliRatchet } from '../cli/cli-ratchet.js';

export class UniqueFileRename {
  public static async process(inFolder: string, recursive: boolean = false, dryRun: boolean = false): Promise<number> {
    let rval: number = 0;
    if (!inFolder || inFolder.trim().length === 0) {
      throw new Error('folder must be defined');
    }
    if (!fs.existsSync(inFolder)) {
      throw new Error(inFolder + ' does not exist');
    }
    const stats: Stats = fs.statSync(inFolder);
    if (!stats.isDirectory()) {
      throw new Error(inFolder + ' is not a folder');
    }

    const contFiles: string[] = fs.readdirSync(inFolder);
    for (let i = 0; i < contFiles.length; i++) {
      const full: string = path.join(inFolder, contFiles[i]);
      const s2: Stats = fs.statSync(full);
      if (s2.isFile()) {
        const newNamePart: string = Date.now() + '_' + rval;
        const idx: number = contFiles[i].lastIndexOf('.');
        const newName: string = idx > -1 ? newNamePart + contFiles[i].substring(idx) : newNamePart;
        const newFull: string = path.join(inFolder, newName);
        if (dryRun) {
          Logger.info('Would have renamed %s to %s', full, newFull);
        } else {
          Logger.info('Renaming %s to %s', full, newFull);
          fs.renameSync(full, newFull);
        }
        rval++;
      } else if (s2.isDirectory()) {
        if (recursive) {
          rval += await UniqueFileRename.process(full, recursive, dryRun);
        } else {
          Logger.info('Ignoring %s - folder, and recursive not specified', full);
        }
      } else {
        Logger.info('Ignoring %s - neither file nor folder', full);
      }
    }

    return rval;
  }

  /**
   And, in case you are running this command line...
   TODO: should use switches to allow setting the various non-filename params
   **/
  public static async runFromCliArgs(args: string[]): Promise<string> {
    if (args.length !== 3) {
      Logger.infoP('Usage: ratchet-unique-file-rename {folder} {recursive} {dryrun}');
      Logger.infoP(args.length);
      return null;
    } else {
      const idx: number = CliRatchet.indexOfCommandArgument('unique-file-rename');
      const folder: string = process.argv[idx + 1];
      const recursive: boolean = BooleanRatchet.parseBool(process.argv[idx + 2]);
      const dryrun: boolean = BooleanRatchet.parseBool(process.argv[idx + 3]);

      Logger.info('Running UniqueFileName from command line arguments Folder: %s Recursive: %s DryRun: %s', folder, recursive, dryrun);

      return StringRatchet.safeString(UniqueFileRename.process(folder, recursive, dryrun));
    }
  }
}
