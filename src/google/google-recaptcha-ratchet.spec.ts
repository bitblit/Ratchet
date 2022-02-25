import { GoogleRecaptchaRatchet } from './google-recaptcha-ratchet';

describe('#googleRecaptchaService', () => {
  xit('should validate a recaptcha token', async () => {
    const res: any = await GoogleRecaptchaRatchet.verifyRecaptchaToken('anykey', 'anytoken');
    expect(res).toBeTruthy();
  });
});
