/*
    Functions for working with csv data
*/

import { readFileSync, existsSync, ReadStream } from 'fs';
import * as csvparse from 'csv-parse';
import * as fs from 'fs';
import { Logger } from './logger';
import * as stringify from 'csv-stringify';

export class CsvRatchet {
  public static async streamParse<T>(readStream: ReadStream, pf: ParseFunction<T>): Promise<T[]> {
    return new Promise((res, rej) => {
      const rval: T[] = [];
      const p = csvparse({
        delimiter: ',',
        columns: true,
      });

      p.on('readable', () => {
        let record: any = p.read();
        while (record) {
          const newVal: T = pf(record);
          if (newVal) {
            rval.push(newVal);
          } else {
            // Logger.debug('Stripping %j', record);
          }
          record = p.read();
        }
      });

      p.on('error', (err) => {
        rej(err);
      });

      p.on('end', () => {
        res(rval);
      });

      readStream.pipe(p);
    });
  }

  public static async fileParse<T>(filename: string, pf: ParseFunction<T>): Promise<T[]> {
    const readStream: ReadStream = fs.createReadStream(filename);
    return CsvRatchet.streamParse<T>(readStream, pf);
  }

  public static async generateCsvData(objectsToConvert: any[], opts: stringify.Options): Promise<string> {
    Logger.silly('Converting %d items into csv file', objectsToConvert.length);
    const genProm: Promise<string> = new Promise<string>((res, rej) => {
      stringify(objectsToConvert, opts, function (err, data) {
        if (err) {
          rej(err);
        } else {
          res(data);
        }
      });
    });
    return genProm;
  }
}

interface ParseFunction<T> {
  (row: any): T;
}
