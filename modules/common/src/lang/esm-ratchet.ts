/**
 * Functions to ease the transition to using ESM instead of CommonJS
 */

import url from 'url';

export class EsmRatchet {
  public static fetchDirName(): string {
    const rval: string = url.fileURLToPath(new URL('.', import.meta.url));
    return rval;
  }

  public static fetchFileName(): string {
    const rval: string = url.fileURLToPath(import.meta.url);
    return rval;
  }
}
