import { expect } from 'chai';
import { BooleanRatchet } from '../../src/common/boolean-ratchet';
import * as stringify from 'csv-stringify';
import { CsvRatchet, Logger, PromiseRatchet } from '../../src/common';
import { Subject } from 'rxjs';
import { StringWritable } from '../../src/stream/string-writable';

describe('#streamObjectsToCsv', function () {
  this.timeout(30000);

  it('should stream objects to a csv', async () => {
    // Logger.setLevelByName('debug');
    const sub: Subject<TestItem> = new Subject<TestItem>();
    const out: StringWritable = new StringWritable();

    const prom: Promise<number> = CsvRatchet.streamObjectsToCsv<TestItem>(sub, out); //, opts);

    for (let i = 1; i < 6; i++) {
      Logger.debug('Proc : %d', i);
      sub.next({ a: i, b: 'test ' + i + ' ,,' });
      await PromiseRatchet.wait(1000);
    }
    sub.complete();

    Logger.debug('Waiting on write');
    const result: number = await prom;
    Logger.debug('Write complete');
    const val: string = out.value;

    expect(result).to.equal(5);
    Logger.debug('Have res : %d and val : \n%s', result, val);
  });
});

export interface TestItem {
  a: number;
  b: string;
}
