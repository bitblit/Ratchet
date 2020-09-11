import * as fs from 'fs';
import * as moment from 'moment-timezone';
import { Logger } from '../common/logger';
import { CliRatchet } from '../common/cli-ratchet';

export class ApplyCircleCiEnvVariablesToFiles {
  public static async process(
    fileNames: string[],
    timezone = 'America/Los_Angeles',
    buildFinder = 'LOCAL-SNAPSHOT',
    branchFinder = 'LOCAL-BRANCH',
    hashFinder = 'LOCAL-HASH',
    tagFinder = 'LOCAL-TAG',
    timeFinder = 'LOCAL-TIME'
  ): Promise<number> {
    if (!fileNames) {
      throw new Error('fileNames must be defined');
    }
    if (fileNames.length === 0) {
      Logger.warn('Warning - no files supplied to process');
    }
    const buildNum: string = process.env['CIRCLE_BUILD_NUM'];
    const branch: string = process.env['CIRCLE_BRANCH'] || '';
    const tag: string = process.env['CIRCLE_TAG'] || '';
    const sha1: string = process.env['CIRCLE_SHA1'] || '';
    const localTime: string = moment().tz(timezone).format('MMMM Do YYYY, h:mm:ss a z');

    if (!buildNum) {
      throw new Error('CIRCLE_BUILD_NUM env var not set - apparently not in a CircleCI environment');
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
          contents = contents.split(hashFinder).join(tag);
          contents = contents.split(tagFinder).join(sha1);
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
    if (process && process.argv && process.argv.length > 2) {
      rval = process.argv.slice(2);
    }
    return rval;
  }
}

if (CliRatchet.isCalledFromCLI('apply-circle-ci-env-variables-to-files')) {
  /**
   And, in case you are running this command line...
  TODO: should use switches to allow setting the various non-filename params
  **/
  Logger.info('Running ApplyCircleCiEnvVariablesToFiles from command line arguments');
  const filenames: string[] = ApplyCircleCiEnvVariablesToFiles.extractFileNames();
  if (filenames.length > 0) {
    ApplyCircleCiEnvVariablesToFiles.process(filenames).then((res) => {
      Logger.info('Processed %d files of %d', res, filenames.length);
    });
  } else {
    console.log('Usage : node apply-circle-ci-env-variables-to-files {file1} {file2} ...');
  }
}
