import { WardenContactType } from '../model/warden-contact-type.js';
import { WardenContact } from '../model/warden-contact.js';
import { WardenUtils } from './warden-utils.js';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';

describe('#WardenUtils', () => {
  //beforeEach(() => {});

  test('Should convert a string to a contact type', async () => {
    const output: WardenContact = WardenUtils.stringToWardenContact('test@test.com');
    expect(output).not.toBeNull();
    expect(output.value).toEqual('test@test.com');
    expect(output.type).toEqual(WardenContactType.EmailAddress);
  });
});
