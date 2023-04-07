import { EpsilonWebsiteStack } from './epsilon-website-stack.js';

describe('#epsilonWebsiteStack', function () {
  it('should extract apex domains', async () => {
    expect(EpsilonWebsiteStack.extractApexDomain('a.b.test.com')).toEqual('test.com');
    expect(EpsilonWebsiteStack.extractApexDomain('www.test.com')).toEqual('test.com');
    expect(EpsilonWebsiteStack.extractApexDomain('test.com')).toEqual('test.com');
  }, 500);
});
