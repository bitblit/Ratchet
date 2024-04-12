import { Subject } from 'rxjs';
import { CsvRatchet } from './csv-ratchet.js';
import { Logger } from '@bitblit/ratchet-common';
import { PromiseRatchet } from '@bitblit/ratchet-common';
import { StringWritable } from '../stream/string-writable.js';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';

describe('#streamObjectsToCsv', function () {
  test('should parse a string', async () => {
    const testString: string = 'a,b\n1,2\n3,4\n';
    const out: TestItem[] = await CsvRatchet.stringParse<TestItem>(testString, CsvRatchet.defaultParseFunction<TestItem>);

    expect(out).toBeTruthy();
    expect(out.length).toEqual(2);
    // Need a real parse function to make this a number, and I am not testing that part here
    expect(out[0].a).toEqual('1');
    expect(out[1].a).toEqual('3');
  });

  test('should generate csv data', async () => {
    const output: TestItem[] = [
      { a: 1, b: '2' },
      { a: 3, b: '4' },
    ];
    const testString: string = await CsvRatchet.generateCsvData(output);

    expect(testString).toBeTruthy();
    expect(testString.length).toBeGreaterThan(10);
  });

  test('should stream objects to a csv', async () => {
    // Logger.setLevel(LoggerLevelName.debug);
    const sub: Subject<TestItem> = new Subject<TestItem>();
    const out: StringWritable = new StringWritable();

    const prom: Promise<number> = CsvRatchet.streamObjectsToCsv<TestItem>(sub, out); //, opts);

    for (let i = 1; i < 6; i++) {
      Logger.debug('Proc : %d', i);
      sub.next({ a: i, b: 'test ' + i + ' ,,' });
      await PromiseRatchet.wait(10);
    }
    sub.complete();

    Logger.debug('Waiting on write');

    const result: number = await prom;
    Logger.debug('Write complete');
    const val: string = out.value;

    expect(result).toEqual(5);
    Logger.debug('Have res : %d and val : \n%s', result, val);
  });
});

export interface TestItem {
  a: number;
  b: string;
}
