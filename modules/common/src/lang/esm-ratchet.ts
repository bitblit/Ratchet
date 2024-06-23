/**
 * Functions to ease the transition to using ESM instead of CommonJS
 */

import url from 'url';
import { ErrorRatchet } from "./error-ratchet";
import { Logger } from "../logger/logger";
import { StringRatchet } from "./string-ratchet";

export class EsmRatchet {
  private static readonly DYNAMIC_IMPORT_CACHE: Map<string, Promise<any>> = new Map<string, Promise<any>>();

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

  public static async cachedTypedDynamicImport<T>(libPath: string, importName?: string, requiredKeys?: string[], swallowErrorIfMissing?: boolean): Promise<T> {
    const cacheKey: string = StringRatchet.trimToNull(importName) ? libPath+'__'+importName : libPath;
    let rval: Promise<T> = EsmRatchet.DYNAMIC_IMPORT_CACHE.get(cacheKey) as Promise<T>;
    if (!rval) {
      rval = EsmRatchet.typedDynamicImport<T>(libPath, importName, requiredKeys, swallowErrorIfMissing);
      if (rval) {
        EsmRatchet.DYNAMIC_IMPORT_CACHE.set(cacheKey, rval);
      }
    }
    return rval;
  }


  public static async typedDynamicImport<T>(libPath: string, importName?: string, requiredKeys?: string[], swallowErrorIfMissing?: boolean): Promise<T> {
    let rval: T;
    try {
     rval = await import (libPath);
    } catch (err) {
      if (swallowErrorIfMissing) {
        Logger.debug('Cannot find library %s but swallow specified, returning null', libPath);
        rval = null;
      } else {
        throw ErrorRatchet.fErr('Could not find the "%s" library', libPath);
      }
    }
    if (StringRatchet.trimToNull(importName)) {
      if (rval[importName]) {
        rval = rval[importName];
      } else {
        throw ErrorRatchet.fErr('Imported library %s, tried to load name %s but only found %j', libPath, importName, Object.keys(rval));
      }
    }

    if (requiredKeys?.length && rval) {
      const keys: string[] = Object.keys(rval);
      requiredKeys.forEach(k=>{
        if (!keys.includes(k)) {
          throw ErrorRatchet.fErr('Failed to import "%s" - required keys are %j, but found %j', libPath, requiredKeys, keys);
        }
      })
    }
    return rval;
  }
}
