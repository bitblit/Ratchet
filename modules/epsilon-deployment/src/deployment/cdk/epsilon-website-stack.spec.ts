import { EpsilonWebsiteStack } from './epsilon-website-stack.js';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';

describe('#epsilonWebsiteStack', function () {
  test('should extract apex domains', async () => {
    expect(EpsilonWebsiteStack.extractApexDomain('a.b.test.com')).toEqual('test.com');
    expect(EpsilonWebsiteStack.extractApexDomain('www.test.com')).toEqual('test.com');
    expect(EpsilonWebsiteStack.extractApexDomain('test.com')).toEqual('test.com');
  }, 500);
});
