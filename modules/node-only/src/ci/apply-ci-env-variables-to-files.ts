import fs from 'fs';
import { Logger } from '@bitblit/ratchet-common';
import { CiEnvVariableConfig } from './ci-env-variable-config';
import { ErrorRatchet, RequireRatchet, StringRatchet, GlobalRatchet } from '@bitblit/ratchet-common';
import { CiEnvVariableConfigUtil } from './ci-env-variable-config-util';

export class ApplyCiEnvVariablesToFiles {
  public static async process(
    fileNames: string[],
    cfg: CiEnvVariableConfig,
    buildFinder = 'LOCAL-SNAPSHOT',
    branchFinder = 'LOCAL-BRANCH',
    hashFinder = 'LOCAL-HASH',
    tagFinder = 'LOCAL-TAG',
    timeFinder = 'LOCAL-TIME'
  ): Promise<number> {
    RequireRatchet.notNullOrUndefined(cfg, 'cfg');
    RequireRatchet.notNullOrUndefined(cfg.buildNumberVar, 'cfg.buildNumberVar');
    if (!fileNames) {
      throw new Error('fileNames must be defined');
    }
    if (fileNames.length === 0) {
      Logger.warn('Warning - no files supplied to process');
    }
    const buildNum: string = GlobalRatchet.fetchGlobalVar(cfg.buildNumberVar);
    const branch: string = cfg.branchVar ? GlobalRatchet.fetchGlobalVar(cfg.branchVar) : null || cfg.branchDefault;
    const tag: string = cfg.tagVar ? GlobalRatchet.fetchGlobalVar(cfg.tagVar) : null || cfg.tagDefault;
    const sha1: string = cfg.hashVar ? GlobalRatchet.fetchGlobalVar(cfg.hashVar) : null || cfg.hashDefault;
    const localTime: string = cfg.localTimeVar ? GlobalRatchet.fetchGlobalVar(cfg.localTimeVar) : null || cfg.localTimeDefault;

    if (!buildNum) {
      ErrorRatchet.throwFormattedErr('%s env var not set - apparently not in a CI environment', cfg.buildNumberVar);
    }

    Logger.info(
      'Processing files %j with build %s, branch %s, tag %s, sha %s, time: %s',
      fileNames,
      buildNum,
      branch,
      tag,
      sha1,
      localTime
    );

    let foundCount = 0;
    fileNames.forEach((f) => {
      if (!fs.existsSync(f)) {
        Logger.error('Could not find file %s to process, continuing', f);
      } else {
        try {
          let contents: string = fs.readFileSync(f).toString();
          contents = contents.split(buildFinder).join(buildNum);
          contents = contents.split(branchFinder).join(branch);
          contents = contents.split(hashFinder).join(sha1);
          contents = contents.split(tagFinder).join(tag);
          contents = contents.split(timeFinder).join(localTime);
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

  public static extractVariableConfig(): CiEnvVariableConfig {
    let rval: CiEnvVariableConfig = null;
    if (process && process.argv && process.argv.length > 2) {
      const name: string = StringRatchet.trimToEmpty(process.argv[2]).toLowerCase();
      switch (name) {
        case 'circleci':
          rval = CiEnvVariableConfigUtil.createDefaultCircleCiVariableConfig();
          break;
        case 'github':
          rval = CiEnvVariableConfigUtil.createDefaultGithubActionsVariableConfig();
          break;
        default:
          ErrorRatchet.throwFormattedErr('Unrecognized env var config type : %s', name);
      }
    }
    Logger.info('Using variable config : %j', rval);

    return rval;
  }

  /**
   And, in case you are running this command line...
   TODO: should use switches to allow setting the various non-filename params
   **/
  public static async runFromCliArgs(args: string[]): Promise<number> {
    const filenames: string[] = ApplyCiEnvVariablesToFiles.extractFileNames();
    if (filenames.length > 0) {
      return ApplyCiEnvVariablesToFiles.process(filenames, ApplyCiEnvVariablesToFiles.extractVariableConfig());
    } else {
      Logger.infoP('Usage : ratchet-apply-ci-env-variables-to-files {file1} {file2} ...');
      return -1;
    }
  }
}
