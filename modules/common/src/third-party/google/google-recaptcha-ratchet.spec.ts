import { GoogleRecaptchaRatchet } from './google-recaptcha-ratchet.js';
import { describe, expect, test, vi } from 'vitest';

const fakeFetch = vi.fn((_input, _init) =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true }),
  } as Response),
);

const fakeFailFetch = vi.fn((_input, _init) => Promise.reject('Failed to read'));

describe('#googleRecaptchaService', () => {
  test('should validate a recaptcha token', async () => {
    const res: any = await GoogleRecaptchaRatchet.verifyRecaptchaToken('anykey', 'anytoken', fakeFetch);
    expect(res).toBeTruthy();
  });

  test('should fail with no token', async () => {
    const res: any = await GoogleRecaptchaRatchet.verifyRecaptchaToken('anykey', null, fakeFetch);
    expect(res).toBeFalsy();
  });

  test('should fail if http fails', async () => {
    const res: any = await GoogleRecaptchaRatchet.verifyRecaptchaToken('anykey', 'anytoken', fakeFailFetch);
    expect(res).toBeFalsy();
  });
});
