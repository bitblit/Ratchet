import { GitRatchet } from './git-ratchet.js';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { Logger } from "@bitblit/ratchet-common/logger/logger";

describe('#gitRatchet', function () {
  test('should fetch last commit data', async () => {
    const res: any = await GitRatchet.getLastCommitSwallowException();
    expect(res).toBeTruthy();
    Logger.info('Got: %j', res);
  }, 10_000); // Ever so often this is slow... and it is really an integration test anyway
});
