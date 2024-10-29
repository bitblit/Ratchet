import { describe, expect, test } from 'vitest';
import { EpsilonStackUtil } from './epsilon-stack-util.js';

describe('#EpsilonStackUtil', function () {
  test('should extract apex domains', async () => {
    expect(EpsilonStackUtil.extractApexDomain('a.b.test.com')).toEqual('test.com');
    expect(EpsilonStackUtil.extractApexDomain('www.test.com')).toEqual('test.com');
    expect(EpsilonStackUtil.extractApexDomain('test.com')).toEqual('test.com');
  }, 500);
});
