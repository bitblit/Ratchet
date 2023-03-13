import { WardenContactType } from '../model/warden-contact-type';
import { WardenContact } from '../model/warden-contact';
import { WardenUtils } from './warden-utils';

describe('#WardenUtils', () => {
  beforeEach(() => {});

  it('Should convert a string to a contact type', async () => {
    const output: WardenContact = WardenUtils.stringToWardenContact('test@test.com');
    expect(output).not.toBeNull();
    expect(output.value).toEqual('test@test.com');
    expect(output.type).toEqual(WardenContactType.EmailAddress);
  });
});
