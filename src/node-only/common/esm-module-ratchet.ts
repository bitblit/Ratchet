import path from 'path';
import {fileURLToPath} from "url";

// Utils for working with esm modules
export class EsmModuleRatchet {
  // Empty constructor prevents instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  // Taken heavily from https://bobbyhadz.com/blog/javascript-dirname-is-not-defined-in-es-module-scope
  /*public static fetchModuleRootDirName(): string {
    return EsmModuleRatchet.fetchLocalDirOfUrl(import.meta.url);
  }

   */

  public static fetchLocalDirOfUrl(url: any): string {
    const filePath: string = fileURLToPath(url);
    const dirPath: string=path.dirname(filePath);
    return dirPath;
  }

}
