import { JwtRatchet } from './jwt-ratchet.js';
import { ExpiredJwtHandling } from './expired-jwt-handling.js';
import { expect, test, describe } from 'vitest';
import { JwtRatchetConfig } from "./jwt-ratchet-config";
import { LoggerLevelName } from "../logger/logger-level-name";
import { JwtLibLike } from "./jwt-lib-like";

describe('#jwtRatchet', function () {

  function createConfig() : JwtRatchetConfig {
    const jwtRatchetConfig: JwtRatchetConfig = {
      encryptionKeyPromise: Promise.resolve('test1234'),
      decryptKeysPromise: Promise.resolve([]),
      jtiGenerator: undefined,
      decryptOnlyKeyUseLogLevel: undefined,
      parseFailureLogLevel: undefined,
      jwtLibPromise: JwtRatchet.dynamicallyLoadLibraryDefaultExportAsJwtLibLike('jsonwebtoken')
    };
    return jwtRatchetConfig;
  }

  test('should test expiration flag for a token with millisecond expiration', async () => {
    const jwt: JwtRatchet = new JwtRatchet(createConfig());

    const token1: string = await jwt.createTokenString({ test: 1, exp: Date.now() - 100 }, null);

    const output: any = await jwt.decodeToken(token1, ExpiredJwtHandling.ADD_FLAG);
    expect(output).not.toBeNull();
    expect(JwtRatchet.hasExpiredFlag(output)).toBeTruthy();
  });

  test('should test expiration calculation for a token', async () => {
    const jwt: JwtRatchet = new JwtRatchet(createConfig());

    const token1: string = await jwt.createTokenString({ test: 1 }, 120);
    const output: number = await JwtRatchet.secondsRemainingUntilExpiration(token1, jwt.jwtLibPromise);

    expect(output).not.toBeNull();
    expect(output).toBeLessThan(121);
    expect(output).toBeGreaterThan(115);
  });

  test('should test round-trip for a token', async () => {
    const jwt: JwtRatchet = new JwtRatchet(createConfig());

    const token1: string = await jwt.createTokenString({ test: 1 }, 120);
    const output: any = await jwt.decodeToken(token1);

    expect(output).not.toBeNull();
    expect(output['test']).toEqual(1);
  });

  test('should test round-trip for a token with array enc keys', async () => {
    const subCfg: JwtRatchetConfig = createConfig();
    subCfg.encryptionKeyPromise = Promise.resolve(['test1234', 'test5678']);
    const jwt: JwtRatchet = new JwtRatchet(subCfg);

    const token1: string = await jwt.createTokenString({ test: 1 }, 120);
    const token2: string = await jwt.createTokenString({ test: 1 }, 120);
    const token3: string = await jwt.createTokenString({ test: 1 }, 120);
    const output1: any = await jwt.decodeToken(token1);
    const output2: any = await jwt.decodeToken(token2);
    const output3: any = await jwt.decodeToken(token3);

    expect(output1).not.toBeNull();
    expect(output1['test']).toEqual(1);
    expect(output2).not.toBeNull();
    expect(output2['test']).toEqual(1);
    expect(output3).not.toBeNull();
    expect(output3['test']).toEqual(1);
  });

  test('should decode with a decode key', async () => {
    const oldCfg: JwtRatchetConfig = createConfig();
    oldCfg.encryptionKeyPromise = Promise.resolve('oldKey');
    const newCfg: JwtRatchetConfig =createConfig();
    newCfg.encryptionKeyPromise = Promise.resolve('newKey');
    newCfg.decryptKeysPromise = Promise.resolve(['oldKey']);

    const jwtOld: JwtRatchet = new JwtRatchet(oldCfg);
    const jwtNew: JwtRatchet = new JwtRatchet(newCfg);

    const token1: string = await jwtOld.createTokenString({ test: 1 }, 120);
    const output: any = await jwtNew.decodeToken(token1);

    expect(output).not.toBeNull();
    expect(output['test']).toEqual(1);
  });
});
