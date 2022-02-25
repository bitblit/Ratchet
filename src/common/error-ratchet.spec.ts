import { ErrorRatchet } from './error-ratchet';

describe('#errorRatchet', function () {
  it('should cast to error', async () => {
    const e1: Error = new Error('test1');
    const e2: string = 'test2';

    const e1p: Error = ErrorRatchet.asErr(e1);
    const e2p: Error = ErrorRatchet.asErr(e2);
    const en: Error = ErrorRatchet.asErr(null);

    expect(en).toBeNull();
    expect(e1p).toEqual(e1);
    expect(e2p).not.toEqual(e2);
    expect(e2p instanceof Error).toBeTruthy();
  });
});
