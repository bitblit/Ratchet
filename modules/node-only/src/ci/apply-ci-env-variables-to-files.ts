import fs from 'fs';
import { ErrorRatchet } from '@bitblit/ratchet-common/lib/lang/error-ratchet.js';
import { Logger } from '@bitblit/ratchet-common/lib/logger/logger.js';
import { RequireRatchet } from '@bitblit/ratchet-common/lib/lang/require-ratchet.js';
import { StringRatchet } from '@bitblit/ratchet-common/lib/lang/string-ratchet.js';
import { CiRunInformation } from './ci-run-information.js';
import { CiRunInformationUtil } from './ci-run-information-util.js';

export class ApplyCiEnvVariablesToFiles {
  public static async process(
    fileNames: string[],
    cfg: CiRunInformation,
    buildFinder = 'LOCAL-SNAPSHOT',
    branchFinder = 'LOCAL-BRANCH',
    hashFinder = 'LOCAL-HASH',
    tagFinder = 'LOCAL-TAG',
    timeFinder = 'LOCAL-TIME'
  ): Promise<number> {
    RequireRatchet.notNullOrUndefined(cfg, 'cfg');
    RequireRatchet.notNullOrUndefined(cfg.buildNumber, 'cfg.buildNumber');
    RequireRatchet.notNullOrUndefined(cfg.localTime, 'cfg.localTime');
    if (!fileNames) {
      throw new Error('fileNames must be defined');
    }
    if (fileNames.length === 0) {
      Logger.warn('Warning - no files supplied to process');
    }
    if (!cfg.buildNumber) {
      ErrorRatchet.throwFormattedErr('%s env var not set - apparently not in a CI environment', cfg.buildNumber);
    }

    Logger.info('Processing files %j with run info %j', cfg);

    let foundCount = 0;
    fileNames.forEach((f) => {
      if (!fs.existsSync(f)) {
        Logger.error('Could not find file %s to process, continuing', f);
      } else {
        try {
          let contents: string = fs.readFileSync(f).toString();
          contents = contents.split(buildFinder).join(cfg.buildNumber);
          contents = contents.split(branchFinder).join(cfg.branch || '');
          contents = contents.split(hashFinder).join(cfg.commitHash || '');
          contents = contents.split(tagFinder).join(cfg.tag || '');
          contents = contents.split(timeFinder).join(cfg.localTime || '');
          fs.writeFileSync(f, contents);
          foundCount++;
        } catch (err) {
          Logger.error('Error processing %s , continuing: %s', f, err, err);
        }
      }
    });

    return foundCount;
  }

  public static extractFileNames(): string[] {
    let rval: string[] = [];
    if (process && process.argv && process.argv.length > 3) {
      rval = process.argv.slice(3);
    }
    return rval;
  }

  public static extractVariableConfig(inName: string): CiRunInformation {
    let rval: CiRunInformation = null;
    const name: string = StringRatchet.trimToEmpty(inName).toLowerCase();
    switch (name) {
      case 'circleci':
        rval = CiRunInformationUtil.createDefaultCircleCiRunInformation();
        break;
      case 'github':
        rval = CiRunInformationUtil.createDefaultGithubActionsRunInformation();
        break;
      case 'test':
        rval = CiRunInformationUtil.createTestingCiRunInformation();
        break;
      default:
        ErrorRatchet.throwFormattedErr('Unrecognized env var config type : %s', name);
    }
    Logger.info('Using variable config : %j', rval);

    return rval;
  }

  /**
   And, in case you are running this command line...
   TODO: should use switches to allow setting the various non-filename params
   **/
  public static async runFromCliArgs(args: string[]): Promise<number> {
    if (args.length > 1) {
      return ApplyCiEnvVariablesToFiles.process(args.slice(1), ApplyCiEnvVariablesToFiles.extractVariableConfig(args[0]));
    } else {
      Logger.infoP('Usage : apply-ci-env-variables-to-files {file1} {file2} ...');
      return -1;
    }
  }
}
