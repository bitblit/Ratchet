import { StopWatch } from './stop-watch.js';
import { PromiseRatchet } from './promise-ratchet.js';

describe('#elapsedMS', function () {
  it('should calculate elapsed MS correctly', async () => {
    const sw: StopWatch = new StopWatch();
    await PromiseRatchet.wait(500);
    const elapsed: number = sw.elapsedMS();
    expect(elapsed).toBeGreaterThan(500);
    expect(elapsed).toBeLessThan(600);
  });
});
