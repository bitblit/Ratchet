import { GoogleRecaptchaRatchet } from './google-recaptcha-ratchet.js';
import { jest } from '@jest/globals';

const fakeFetch = jest.fn((input, init) =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true }),
  } as Response),
);

const fakeFailFetch = jest.fn((input, init) => Promise.reject('Failed to read'));

describe('#googleRecaptchaService', () => {
  it('should validate a recaptcha token', async () => {
    const res: any = await GoogleRecaptchaRatchet.verifyRecaptchaToken('anykey', 'anytoken', fakeFetch);
    expect(res).toBeTruthy();
  });

  it('should fail with no token', async () => {
    const res: any = await GoogleRecaptchaRatchet.verifyRecaptchaToken('anykey', null, fakeFetch);
    expect(res).toBeFalsy();
  });

  it('should fail if http fails', async () => {
    const res: any = await GoogleRecaptchaRatchet.verifyRecaptchaToken('anykey', 'anytoken', fakeFailFetch);
    expect(res).toBeFalsy();
  });
});
