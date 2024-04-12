import { SortRatchet } from './sort-ratchet.js';
import { Logger } from '../logger/logger.js';
import { expect, test, describe } from 'vitest';

describe('#sortRatchet', function () {
  test('sort nulls and undefined to the top', async () => {
    const input: string[] = [null, 'a', null, 'b', null, 'c'];
    input.sort((a, b) => SortRatchet.sortNullToTop<string>(a, b, (a, b) => a.localeCompare(b)));

    expect(input.length).toEqual(6);
    expect(input[3]).toEqual('a');
    expect(input[0]).toBeFalsy();
    expect(input[1]).toBeFalsy();
    expect(input[2]).toBeFalsy();
  });

  test('sort nulls and undefined to the bottom', async () => {
    const input: string[] = ['a', null, 'b', undefined, 'c', null];
    input.sort((a, b) => SortRatchet.sortNullToBottom<string>(a, b, (a, b) => a.localeCompare(b)));

    Logger.info('%j', input);

    expect(input.length).toEqual(6);
    expect(input[0]).toEqual('a');
    expect(input[3]).toBeFalsy();
    expect(input[4]).toBeFalsy();
    expect(input[5]).toBeFalsy();
  });

  test('sort mixed numbers and strings as numbers', async () => {
    const input: (string | number)[] = ['1', 10, '5', 20, '-8', 35.2];
    input.sort(SortRatchet.sortNumericStringsAsNumbers);

    Logger.info('%j', input);

    expect(input.length).toEqual(6);
    expect(input[0]).toEqual('-8');
    expect(input[1]).toEqual('1');
    expect(input[2]).toEqual('5');
    expect(input[3]).toEqual(10);
    expect(input[4]).toEqual(20);
    expect(input[5]).toEqual(35.2);
  });

  test('sort mixed numbers and strings as numbers handling string as null', async () => {
    const input: (string | number)[] = ['a', 10, 'b', 20, '-8', 35.2];
    input.sort(SortRatchet.sortNumericStringsAsNumbers);

    Logger.info('%j', input);

    expect(input[0]).toEqual('-8');
    expect(input[1]).toEqual(10);
    expect(input[2]).toEqual(20);
    expect(input[3]).toEqual(35.2);
    expect(input[4]).toEqual('a');
    expect(input[5]).toEqual('b');
  });
});
