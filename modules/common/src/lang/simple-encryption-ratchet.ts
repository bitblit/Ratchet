import { RequireRatchet } from "./require-ratchet.ts";
import { NumberRatchet } from "./number-ratchet.ts";

/**
 * A VERY simple wrapper for doing basic AES-GCM encryption on arbitrary text -
 * useful for slugs, etc., since the same code should work both in Node.js and
 * most modern browsers
 */
export class SimpleEncryptionRatchet{
  private sharedKey: Promise<CryptoKey>;

  constructor(sharedRawKey: string | Promise<string>, private ivLength: number = 12) { // Recommended for AES-GCM
    RequireRatchet.notNullOrUndefined(sharedRawKey);
    RequireRatchet.true(ivLength>=12, 'ivLength must be at least 12');
    this.sharedKey = this.createSharedKey(sharedRawKey);
  }

  // Converts string to ArrayBuffer
  private strToBuf(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  }

  // Converts ArrayBuffer to base64
  private bufToBase64(buf: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
  }

  // Converts base64 to ArrayBuffer
  private base64ToBuf(base64: string): Uint8Array {
    return new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)));
  }


  // Encrypt a string with a shared key
  public async encrypt(data: string): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));
    const encoded = this.strToBuf(data);
    const key: CryptoKey = await this.sharedKey;
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoded
    );
    const ivMsg: string = this.bufToBase64(iv);
    const dataMsg: string = this.bufToBase64(ciphertext);

    // Format it up in a way that can be unrolled later
    return ivMsg.length+'K'+ivMsg+dataMsg;
  }

  // Decrypt a string with the shared key
  public async decrypt(encryptedValue: string): Promise<string> {
    const split: number = encryptedValue?.indexOf('K')
    if (!split || split<1) {
      throw new Error('Invalid split : '+split);
    }
    const ivLen: number = NumberRatchet.safeNumber(encryptedValue.substring(0, split));
    const iv: string = encryptedValue.substring(split+1, split+1+ivLen);
    const data: string = encryptedValue.substring(split+1+ivLen);

    const key: CryptoKey = await this.sharedKey;
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: this.base64ToBuf(iv) },
      key,
      this.base64ToBuf(data)
    );
    return new TextDecoder().decode(decrypted);
  }

  // Generate or import a shared key
  private async createSharedKey(rawKeyIn: string | Promise<string>): Promise<CryptoKey> {
    const rawKey: string = typeof rawKeyIn === 'string' ? rawKeyIn : await rawKeyIn;
    const keyMaterial = this.strToBuf(rawKey.padEnd(32, '0').slice(0, 32)); // 256-bit key
    return crypto.subtle.importKey(
      "raw",
      keyMaterial,
      "AES-GCM",
      false,
      ["encrypt", "decrypt"]
    );
  }
}