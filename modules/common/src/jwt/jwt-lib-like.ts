/**
 * This object provides the functions listed below.  The default implementation would
 * be the library "jsonwebtoken", but adapters are concievable
 */
export interface JwtLibLike {
  verify(payload: string, decryptKey: string, params: Record<string,any>): Promise<Record<string,any>>;
  sign(payload: string, encKey: string): Promise<string>;
  decode<T>(token: string): Promise<T>;
}
