import { GlobalRatchet } from './global-ratchet';
import { StringRatchet } from './string-ratchet';

describe('#globalRatchet', function () {
  it('fetch and set global variables', async () => {
    const tester: string = StringRatchet.createType4Guid();
    const tester2: string = StringRatchet.createType4Guid();
    process.env['GLOBALTEST']=tester;

    const value: string = GlobalRatchet.fetchGlobalVar('GLOBALTEST');
    expect(value).toEqual(tester);
    GlobalRatchet.setGlobalVar('GLOBALTEST', tester2);
    const value: string = GlobalRatchet.fetchGlobalVar('GLOBALTEST');
    expect(value).toEqual(tester2);

  });
});
