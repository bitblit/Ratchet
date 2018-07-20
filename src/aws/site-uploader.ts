/*
import logging
import time
import boto3
import simplejson
import sys
import os
import re
import copy
import mimetypes
*/

import * as fs from 'fs';
import * as walk from 'walk';
import * as AWS from 'aws-sdk';
import {ClientConfiguration} from 'aws-sdk/clients/s3';
import * as path from 'path';
import * as mime from 'mime-types';
import {Logger} from '../common/logger';

export class SiteUploader {

  private srcDir: string;
  private bucketName: string;
  private config: any;
  private readonly s3: AWS.S3 = new AWS.S3({region: 'us-east-1'} as ClientConfiguration);

  public static createFromArgs(): SiteUploader {
    if (process && process.argv && process.argv.length  >  2 && process.argv.length < 5) {
      let src = process.argv[2];
      let bucket = process.argv[3];
      let configFile = process.argv[4];

      return new SiteUploader(src, bucket, configFile);
    } else {
      console.log('Usage : node site-uploader {srcDir} {bucket} {configFile}');
      return null;
    }

  }

  constructor(srcDir: string, bucketName: string, configFile: string) {
    this.srcDir = srcDir;
    this.bucketName = bucketName;
    this.config = JSON.parse(fs.readFileSync(configFile).toString('ascii'));

  }


  findMatch(prefix: string, fileName: string, config: any): any {

    var found = null;

    if (prefix != null && fileName != null && config != null && config.mapping != null) {
      config.mapping.forEach(entry => {
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
    var found = null;

    if (config != null && config.customMimeTypeMapping != null) {
      Object.keys(config.customMimeTypeMapping).forEach(k => {
        if (found == null && fileName.endsWith(k)) {
          found = config.customMimeTypeMapping[k];
        }
      });
    }

    if (found == null) {
      found = mime.lookup(fileName);
    }

    if (found == null) {
      found = 'binary/octet-stream'
    }

    return found
  }

  runPump(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      Logger.info('Uploading contents of %s to %s using %j as config', this.srcDir, this.bucketName, this.config);
      // bucket = boto3.resource("s3").Bucket(bucket)

      let options = {};
      let walker = walk.walk(this.srcDir, options);

      walker.on('file', function (root, fileStats, next) {
        Logger.info('Processing %j', fileStats.name);
        let prefix: string = (root == this.srcDir) ? '' : root.substring(this.srcDir.length + 1) + '/';

        let proc: any = this.findMatch(prefix, fileStats.name, this.config);
        let key: string  = prefix + fileStats.name;
        Logger.info('Uploading file : %s/%s to key %s with %j', root, fileStats.name, key, proc);

        let params: any = (proc && proc.putParams) ? JSON.parse(JSON.stringify(proc.putParams)) : {};

        params.Bucket = this.bucketName;
        params.Key = key;
        params.Body = fs.readFileSync(path.join(root, fileStats.name));

        if (!params.ContentType) {
          params.ContentType = this.findMime(fileStats.name, this.config);
        }

        this.s3.putObject(params).promise().then(result => {
          Logger.info('Finished upload of %s', key);
          next();
        }).catch(err => {
          Logger.warn('%s failed to upload : %s : Continuing', key, err);
          next();
        });
      }.bind(this));

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

