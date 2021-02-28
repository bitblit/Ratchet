import fs from 'fs';
import walk from 'walk';
import AWS from 'aws-sdk';
import { ClientConfiguration } from 'aws-sdk/clients/s3';
import path from 'path';
import mime from 'mime-types';
import { Logger } from '../../common/logger';
import { CliRatchet } from '../common/cli-ratchet';

export class SiteUploader {
  private srcDir: string;
  private bucketName: string;
  private config: any;
  private readonly s3: AWS.S3 = new AWS.S3({ region: 'us-east-1' } as ClientConfiguration);

  constructor(srcDir: string, bucketName: string, configFile: string) {
    this.srcDir = srcDir;
    this.bucketName = bucketName;
    this.config = JSON.parse(fs.readFileSync(configFile).toString('ascii'));
  }

  public static createFromArgs(): SiteUploader {
    if (process && process.argv && process.argv.length > 3 && process.argv[process.argv.length - 4].indexOf('site-uploader') > -1) {
      const src = process.argv[2];
      const bucket = process.argv[3];
      const configFile = process.argv[4];

      return new SiteUploader(src, bucket, configFile);
    } else {
      console.log(
        'Usage : node site-uploader {srcDir} {bucket} {configFile} (Found ' + process.argv.length + ' arguments, need at least 4)'
      );
      return null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  findMatch(prefix: string, fileName: string, config: any): any {
    let found = null;

    if (prefix != null && fileName != null && config != null && config.mapping != null) {
      config.mapping.forEach((entry) => {
        if (found == null) {
          if (entry.prefixMatch == null || prefix.match(entry.prefixMatch)) {
            if (entry.fileMatch == null || fileName.match(entry.fileMatch)) {
              found = entry;
            }
          }
        }
      });
    }

    return found;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  findMime(fileName: string, config: any): string {
    let found = null;

    if (config != null && config.customMimeTypeMapping != null) {
      Object.keys(config.customMimeTypeMapping).forEach((k) => {
        if (found == null && fileName.endsWith(k)) {
          found = config.customMimeTypeMapping[k];
        }
      });
    }

    if (found == null) {
      found = mime.lookup(fileName);
    }

    if (found == null) {
      found = 'binary/octet-stream';
    }

    return found;
  }

  runPump(): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise<any>((resolve, reject) => {
      Logger.info('Uploading contents of %s to %s using %j as config', this.srcDir, this.bucketName, this.config);
      // bucket = boto3.resource("s3").Bucket(bucket)

      const options = {};
      const walker = walk.walk(this.srcDir, options);

      walker.on(
        'file',
        function (root, fileStats, next) {
          Logger.info('Processing %j', fileStats.name);
          const prefix: string = root == this.srcDir ? '' : root.substring(this.srcDir.length + 1) + '/';

          const proc: any = this.findMatch(prefix, fileStats.name, this.config);
          const key: string = prefix + fileStats.name;
          Logger.info('Uploading file : %s/%s to key %s with %j', root, fileStats.name, key, proc);

          const params: any = proc && proc.putParams ? JSON.parse(JSON.stringify(proc.putParams)) : {};

          params.Bucket = this.bucketName;
          params.Key = key;
          params.Body = fs.readFileSync(path.join(root, fileStats.name));

          if (!params.ContentType) {
            params.ContentType = this.findMime(fileStats.name, this.config);
          }

          this.s3
            .putObject(params)
            .promise()
            .then((result) => {
              Logger.info('Finished upload of %s: %j', key, result);
              next();
            })
            .catch((err) => {
              Logger.warn('%s failed to upload : %s : Continuing', key, err);
              next();
            });
        }.bind(this)
      );

      walker.on('errors', function (root, nodeStatsArray, next) {
        next();
      });

      walker.on('end', function () {
        Logger.info('All done');
        resolve(true);
      });
    });
  }
}

if (CliRatchet.isCalledFromCLI('site-uploader')) {
  /**
   And, in case you are running this command line...
   **/
  Logger.info('Running site uploader from command line arguments');
  const uploader: SiteUploader = SiteUploader.createFromArgs();
  if (uploader) {
    uploader.runPump();
  }
}
