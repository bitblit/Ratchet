/**
 * Service for functions that communicate to Google Recaptcha service
 */
import { Logger } from '../../logger/logger.js';
import { StringRatchet } from '../../lang/string-ratchet.js';
import fetch from 'cross-fetch';
export class GoogleRecaptchaRatchet {
  private static readonly GOOGLE_VERIFY_URL: string = 'https://www.google.com/recaptcha/api/siteverify?secret=${KEY}&response=${TOKEN}';

  public static async verifyRecaptchaToken(
    keySecret: string,
    token: string,
    fetchFn: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> = fetch,
  ): Promise<boolean> {
    Logger.debug('Verifying recaptcha token : %s', token);
    let rval: boolean = null;

    if (!StringRatchet.safeString(token)) {
      Logger.warn('Recaptcha validation error, no token passed : %s', token);
      return rval;
    }

    Logger.info('Validating Recaptcha via Google API : %s', token);
    const url: string = StringRatchet.simpleTemplateFill(GoogleRecaptchaRatchet.GOOGLE_VERIFY_URL, { KEY: keySecret, TOKEN: token }, true);
    try {
      const resp: Response = await fetchFn(url);
      const body: any = await resp.json();
      rval = body && body.success;
    } catch (err) {
      Logger.error('Failed to read from google : %s', err);
      rval = false;
    }
    return rval;
  }
}
