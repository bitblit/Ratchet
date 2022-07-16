/**
 * Helper around dynamic imports
 */
import { ErrorRatchet } from './error-ratchet';
import { Logger } from './logger';

export class DynamicImportRatchet {
  private static IMPORT_CACHE: Map<string, Promise<any>> = new Map<string, Promise<any>>();
  // Empty constructor prevents instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static async loadImport(libName: string): Promise<any> {
    let prom: Promise<any> = DynamicImportRatchet.IMPORT_CACHE.get(libName);
    if (!prom) {
      try {
        prom = import(libName);
        DynamicImportRatchet.IMPORT_CACHE.set(libName, prom);
      } catch (err) {
        Logger.error('Failed to dynamically import %s : %s', libName, err);
        ErrorRatchet.throwFormattedErr('Failed to dynamically import %s : %s', libName, err);
      }
      if (!prom) {
        ErrorRatchet.throwFormattedErr('Should not happen - no error, but no promise either : %s', libName);
      }
      return prom;
    }
  }
}
