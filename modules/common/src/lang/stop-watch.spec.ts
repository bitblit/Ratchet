import { StopWatch } from './stop-watch.js';
import { PromiseRatchet } from './promise-ratchet.js';
import { expect, test, describe } from 'vitest';
import { Logger } from "../logger/logger.js";

describe('#elapsedMS', function () {
  test('should calculate elapsed MS correctly', async () => {
    const sw: StopWatch = new StopWatch();
    await PromiseRatchet.wait(500);
    const elapsed: number = sw.elapsedMS();
    expect(elapsed).toBeGreaterThan(500);
    expect(elapsed).toBeLessThan(600);
  });

  test('should dump all', async () => {
    const sw: StopWatch = new StopWatch();
    sw.start('a1');
    await PromiseRatchet.wait(50);
    sw.stop('a1');
    sw.start('b1');
    await PromiseRatchet.wait(60);
    sw.stop('b1');
    sw.start('c1');
    await PromiseRatchet.wait(70);
    sw.stop('c1');
    const names: string[] = sw.timerNames();
    expect(names).toContain('a1');
    expect(names).toContain('b1');
    expect(names).toContain('c1');

    const out: string = sw.dumpAll();
    expect(out).toContain('a1');
    expect(out).toContain('b1');
    expect(out).toContain('c1');
    expect(out).toContain('Overall');
  });


  test('should calc expected', async () => {
    const sw: StopWatch = new StopWatch();

    for (let i=0;i<10;i++) {
      const elapsedTenths: number = Math.floor(sw.elapsedMS()/100);
      const expectedTenths: number = Math.floor(sw.expectedRemainingMS(i/10)/100);
      if (i>0) {
        expect(elapsedTenths).toEqual(i);
        expect(expectedTenths).toEqual(10-i);
      }
      //Logger.info('%d elapsed %d expected -- %s', elapsedTenths, expectedTenths);
      await PromiseRatchet.wait(100)
    }
  });
});
