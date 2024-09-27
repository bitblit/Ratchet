import { HashSpreader } from './hash-spreader.js';
import { expect, test, describe, vi, beforeEach } from 'vitest';

describe('#hashSpreader', function () {
  test('should enumerate spread', async () => {
    const spread: HashSpreader = new HashSpreader(3, 16);
    expect(spread.allBuckets.length).toEqual(16);

    const spread2: HashSpreader = new HashSpreader(3, 19);
    expect(spread2.allBuckets.length).toEqual(19);
  });

  test('should spread1', async () => {
    const spread: HashSpreader = new HashSpreader(3, 16);
    expect(spread.allSpreadValues('x').length).toEqual(16);
  });

  test('should spread multi', async () => {
    const spread: HashSpreader = new HashSpreader(3, 16);
    expect(spread.allSpreadValuesForArray(['x', 'y']).length).toEqual(32);
  });
});
