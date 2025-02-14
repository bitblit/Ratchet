import { Logger } from '@bitblit/ratchet-common/logger/logger';
import jwt from 'jsonwebtoken';
import jwks from 'jwks-rsa';
import { WebTokenManipulator } from './web-token-manipulator.js';
import fetch from 'cross-fetch';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import { JwtTokenBase } from '@bitblit/ratchet-common/jwt/jwt-token-base';

export class GoogleWebTokenManipulator implements WebTokenManipulator<JwtTokenBase> {
  private static readonly GOOGLE_DISCOVERY_DOCUMENT: string = 'https://accounts.google.com/.well-known/openid-configuration';
  private cacheGoogleDiscoveryDocument: any;
  private jwksClient: any;

  constructor(private clientId: string) {}

  public async extractTokenFromAuthorizationHeader(authHeader: string): Promise<JwtTokenBase> {
    let tokenString: string = StringRatchet.trimToEmpty(authHeader);
    if (tokenString.toLowerCase().startsWith('bearer ')) {
      tokenString = tokenString.substring(7);
    }
    const validated: JwtTokenBase = tokenString ? await this.parseAndValidateGoogleToken(tokenString, false) : null;
    return validated;
  }

  public async parseAndValidateGoogleToken(googleToken: string, allowExpired: boolean = false): Promise<JwtTokenBase> {
    Logger.debug('Auth : %s', StringRatchet.obscure(googleToken, 4));

    // First decode so we can get the keys
    const fullToken: any = jwt.decode(googleToken, { complete: true });
    const kid: string = fullToken.header.kid;
    const nowEpochSeconds: number = Math.floor(new Date().getTime() / 1000);

    const pubKey: string = await this.fetchSigningKey(kid);
    const validated: any = jwt.verify(googleToken, pubKey, {
      audience: this.clientId,
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      ignoreExpiration: allowExpired,
      clockTimestamp: nowEpochSeconds,
    });

    return validated;
  }

  private async fetchSigningKey(kid: string): Promise<string> {
    const jClient: any = await this.fetchJwksClient();

    return new Promise<string>((res, rej) => {
      jClient.getSigningKey(kid, (err, key) => {
        if (err) {
          rej(err);
        } else {
          res(key.publicKey || key.rsaPublicKey);
        }
      });
    });
  }

  private async fetchJwksClient(): Promise<any> {
    if (!this.jwksClient) {
      const discDoc: any = await this.fetchGoogleDiscoveryDocument();
      const client: any = jwks({
        cache: true,
        cacheMaxEntries: 5,
        cacheMaxAge: 1000 * 60 * 60 * 10,
        jwksUri: discDoc.jwks_uri,
      });
      this.jwksClient = client;
    }
    return this.jwksClient;
  }

  private async fetchGoogleDiscoveryDocument(): Promise<any> {
    if (!this.cacheGoogleDiscoveryDocument) {
      const resp: Response = await fetch(GoogleWebTokenManipulator.GOOGLE_DISCOVERY_DOCUMENT);
      const doc: any = await resp.json();
      this.cacheGoogleDiscoveryDocument = doc;
    }
    return this.cacheGoogleDiscoveryDocument;
  }
}
