import fs from 'fs';
import walk from 'walk';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import mime from 'mime-types';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { Upload } from '@aws-sdk/lib-storage';

export class SiteUploader {
  private srcDir: string;
  private bucketName: string;
  private config: any;
  private readonly s3: S3Client = new S3Client({ region: 'us-east-1' });

  constructor(srcDir: string, bucketName: string, configFile: string) {
    this.srcDir = srcDir;
    this.bucketName = bucketName;
    this.config = JSON.parse(fs.readFileSync(configFile).toString('ascii'));
  }

  public static createFromArgs(args: string[]): SiteUploader {
    if (args && args.length === 3) {
      const src = args[0];
      const bucket = args[1];
      const configFile = args[2];

      return new SiteUploader(src, bucket, configFile);
    } else {
      console.log('Usage : node ratchet-site-uploader {srcDir} {bucket} {configFile} (Found ' + args + ' arguments, need 3)');
      return null;
    }
  }

  public static async runFromCliArgs(args: string[]): Promise<void> {
    const inst: SiteUploader = SiteUploader.createFromArgs(args);
    return inst.runPump();
  }

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

          const upload: Upload = new Upload({
            client: this.s3,
            params: params,
            tags: [],
            queueSize: 4,
            partSize: 1024 * 1024 * 5,
            leavePartsOnError: false,
          });

          upload.on('httpUploadProgress', (progress) => {
            Logger.debug('Uploading : %s', progress);
          });
          upload
            .done()
            .then((result) => {
              Logger.info('Finished upload of %s: %j', key, result);
              next();
            })
            .catch((err) => {
              Logger.warn('%s failed to upload : %s : Continuing', key, err);
              next();
            });
        }.bind(this),
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
