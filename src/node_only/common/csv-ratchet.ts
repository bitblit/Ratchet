/*
    Functions for working with csv data
*/

import { readFileSync, existsSync, ReadStream } from 'fs';
import csvparse from 'csv-parse';
import parsesync from 'csv-parse/lib/sync';
import fs from 'fs';
import { Logger } from '../../common/logger';
import stringify from 'csv-stringify';
import { RequireRatchet } from '../../common/require-ratchet';
import { MapRatchet } from '../../common/map-ratchet';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { Writable } from 'stream';

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

  public static async generateComparison(file1: string, file2: string, keyField: string): Promise<ComparisonResults> {
    RequireRatchet.notNullOrUndefined(file1, 'file1');
    RequireRatchet.notNullOrUndefined(file2, 'file2');
    RequireRatchet.notNullOrUndefined(keyField, 'keyField');

    Logger.info('Created csv compare with files %s and %s keyed on %s', file1, file2, keyField);
    const file1Raw: string = fs.readFileSync(file1).toString();
    let file1Parsed: any[] = parsesync(file1Raw, {
      columns: true,
      skip_empty_lines: true,
    });
    file1Parsed = file1Parsed.map((m) => {
      const next: any = {};
      Object.keys(m).forEach((k) => {
        next[k.trim()] = m[k];
      });
      return next;
    });
    const file1Mapped: Map<string, any> = MapRatchet.mapByUniqueProperty<any, string>(file1Parsed, keyField);
    const file2Raw: string = fs.readFileSync(file2).toString();
    let file2Parsed: any[] = parsesync(file2Raw, {
      columns: true,
      skip_empty_lines: true,
    });
    file2Parsed = file2Parsed.map((m) => {
      const next: any = {};
      Object.keys(m).forEach((k) => {
        next[k.trim()] = m[k];
      });
      return next;
    });
    const file2Mapped: Map<string, any> = MapRatchet.mapByUniqueProperty<any, string>(file2Parsed, keyField);

    const f1Only: string[] = [];
    const f2Only: string[] = [];
    const both: string[] = [];

    Array.from(file1Mapped.keys()).forEach((f1k) => {
      if (file2Mapped.has(f1k)) {
        both.push(f1k);
      } else {
        f1Only.push(f1k);
      }
    });

    Array.from(file2Mapped.keys()).forEach((f1k) => {
      if (!file1Mapped.has(f1k)) {
        f2Only.push(f1k);
      }
    });

    const rval: ComparisonResults = {
      file1Data: file1Mapped,
      file2Data: file2Mapped,
      file1OnlyKeys: f1Only,
      file2OnlyKeys: f2Only,
      bothFilesKeys: both,
    };

    return rval;
  }

  public static async streamObjectsToCsv<T>(srcSubject: Subject<T>, output: Writable, inOpts?: stringify.Options): Promise<number> {
    RequireRatchet.notNullOrUndefined(srcSubject, 'srcSubject');
    RequireRatchet.notNullOrUndefined(output, 'output');
    const opts: stringify.Options = inOpts || {
      header: true,
    };

    Logger.silly('Running pipe to csv output : %j', opts);
    let count: number = 0;
    const genProm: Promise<number> = new Promise<number>((res, rej) => {
      const stringifier = stringify(opts);
      stringifier.on('error', (err) => {
        if (sub) {
          sub.unsubscribe();
        }
        rej(err);
      });
      stringifier.on('finish', () => {
        if (sub) {
          sub.unsubscribe(); // Cleanup
        }
        res(count);
      });
      stringifier.pipe(output);

      const sub: Subscription = srcSubject.subscribe(
        (next) => {
          Logger.debug('Adding %j to csv', next);
          count++;
          stringifier.write(next);
        },
        (err) => {
          Logger.error('Error generating : %s', err);
          rej(err);
        },
        () => {
          Logger.debug('Finished');
          stringifier.end();
        }
      );
    });
    return genProm;
  }
}

interface ParseFunction<T> {
  (row: any): T;
}

export interface ComparisonResults {
  file1OnlyKeys: string[];
  file2OnlyKeys: string[];
  bothFilesKeys: string[];

  file1Data: Map<string, any>;
  file2Data: Map<string, any>;
}
