import { ErrorRatchet } from '../../common/error-ratchet';
import { StringRatchet } from '../../common/string-ratchet';

/**
 * Ratchet for manipulating credentials
 *
 * Mainly here so I don't have to remember certain specific AWS environmental variable names
 */
export class AwsCredentialsRatchet {
  // Empty constructor prevents instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static applySetProfileEnvironmentalVariable(newProfile: string): void {
    if (!!process.env) {
      if (StringRatchet.trimToNull(newProfile)) {
        process.env['AWS_PROFILE'] = newProfile;
      } else {
        ErrorRatchet.throwFormattedErr('Cannot set profile to null/empty string');
      }
    } else {
      ErrorRatchet.throwFormattedErr('Cannot set profile - not in a node environment - process missing');
    }
  }
}
