import { RequireRatchet } from './require-ratchet.js';
import { fail } from 'assert';
import { Logger } from '../logger/logger.js';
import { expect, test, describe } from 'vitest';

describe('#standardCases', function () {
  test('should throw exception on null value', function () {
    try {
      RequireRatchet.notNullOrUndefined(null, 'test1');
      fail('Should have thrown exception');
    } catch (err) {
      Logger.debug('Correctly threw exception : %s', err);
    }
    try {
      RequireRatchet.notNullOrUndefined(undefined, 'test2');
      fail('Should have thrown exception');
    } catch (err) {
      Logger.debug('Correctly threw exception : %s', err);
    }
  });

  test('should throw exception on whitespace value', function () {
    try {
      RequireRatchet.notNullUndefinedOrOnlyWhitespaceString('', 'test1');
      fail('Should have thrown exception');
    } catch (err) {
      Logger.debug('Correctly threw exception : %s', err);
    }
    try {
      RequireRatchet.notNullUndefinedOrOnlyWhitespaceString('    ', 'test2');
      fail('Should have thrown exception');
    } catch (err) {
      Logger.debug('Correctly threw exception : %s', err);
    }
  });
});

describe('#noNullOrUndefinedValuesInArray', function () {
  test('should throw exception on null value', function () {
    const arr: any[] = [1, null, 'a'];
    try {
      RequireRatchet.noNullOrUndefinedValuesInArray(arr);
      fail('Should have thrown exception');
    } catch (err) {
      Logger.debug('Correctly threw exception : %s', err);
    }
  });

  test('throw exception on bad length', function () {
    const arr: any[] = [1, 2, 'a'];
    try {
      RequireRatchet.noNullOrUndefinedValuesInArray(arr, 4);
      fail('Should have thrown exception');
    } catch (err) {
      Logger.debug('Correctly threw exception : %s', err);
    }
  });

  test('should not throw exception on good values', function () {
    const arr: any[] = [1, 2, 'a'];
    RequireRatchet.noNullOrUndefinedValuesInArray(arr, 3);
  });

  test('should not throw exception on good constructor values', function () {
    const test: ConstructorTester = new ConstructorTester('a', 'b');
  });

  test('throw exception on null constructor param', function () {
    try {
      const test: ConstructorTester = new ConstructorTester('a', null);
      fail('Should have thrown exception');
    } catch (err) {
      Logger.debug('Correctly threw exception : %s', err);
    }
  });
});

export class ConstructorTester {
  constructor(testVal1: string, testVal2: string) {
    Logger.info('Args : %j', this.constructor);
    //Logger.info('Args : %j', this.constructor.arguments.length);

    //RequireRatchet.noNullOrUndefinedValuesInRestArgs(this.constructor.arguments, ...arguments);
  }
}
