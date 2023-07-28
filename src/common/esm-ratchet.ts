/**
 * Functions to ease the transition to using ESM instead of CommonJS
 */

import url from 'url';

export class EsmRatchet {
  public static fetchDirName(root: string): string {
    if (!root) {
      throw new Error('Need to provide root (should be import.meta.url)');
    }
    const rval: string = url.fileURLToPath(new URL('.', root));
    return rval;
  }

  public static fetchFileName(root: string): string {
    if (!root) {
      throw new Error('Need to provide root (should be import.meta.url)');
    }
    const rval: string = url.fileURLToPath(root);
    return rval;
  }
}
