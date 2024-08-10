import { StopWatch } from './stop-watch.js';
import { PromiseRatchet } from './promise-ratchet.js';
import { expect, test, describe } from 'vitest';

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
});
