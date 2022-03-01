import { JwtRatchet } from './jwt-ratchet';

describe('#jwtRatchet', function () {
  it('should test round-trip for a token', async () => {
    const jwt: JwtRatchet = new JwtRatchet(Promise.resolve('test1234'), Promise.resolve([]));

    const token1: string = await jwt.createTokenString({ test: 1 }, 120);
    const output: any = await jwt.decodeToken(token1);

    expect(output).not.toBeNull();
    expect(output['test']).toEqual(1);
  });
});
