import { RequireRatchet } from './require-ratchet';
import { fail } from 'assert';
import { Logger } from './logger';

describe('#noNullOrUndefinedValuesInArray', function () {
  it('should throw exception on null value', function () {
    const arr: any[] = [1, null, 'a'];
    try {
      RequireRatchet.noNullOrUndefinedValuesInArray(arr);
      fail('Should have thrown exception');
    } catch (err) {
      Logger.debug('Correctly threw exception : %s', err);
    }
  });

  it('throw exception on bad length', function () {
    const arr: any[] = [1, 2, 'a'];
    try {
      RequireRatchet.noNullOrUndefinedValuesInArray(arr, 4);
      fail('Should have thrown exception');
    } catch (err) {
      Logger.debug('Correctly threw exception : %s', err);
    }
  });

  it('should not throw exception on good values', function () {
    const arr: any[] = [1, 2, 'a'];
    RequireRatchet.noNullOrUndefinedValuesInArray(arr, 3);
  });
});
