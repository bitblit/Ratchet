import { GoogleWebTokenManipulator } from './google-web-token-manipulator.js';
import { JwtTokenBase } from '@bitblit/ratchet-common';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';

describe('#googleWebTokenManipulator', function () {
  test.skip('should extract a token', async () => {
    const token: string = 'TOKEN_HERE';
    const clientId: string = 'CLIENT_HERE';

    const svc: GoogleWebTokenManipulator = new GoogleWebTokenManipulator(clientId);
    const res: JwtTokenBase = await svc.parseAndValidateGoogleToken<any>(token, false);

    expect(res).toBeTruthy();
  });
});
