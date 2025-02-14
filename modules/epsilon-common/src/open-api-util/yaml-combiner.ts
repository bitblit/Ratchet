/*
    Functions to combine a set of yaml files
*/

import fs from 'fs';
import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet';
import yaml from 'js-yaml';
import { Logger } from '@bitblit/ratchet-common/logger/logger';

export class YamlCombiner {
  public static combine(files: string[], inRootPath: string[] = []): string {
    RequireRatchet.notNullOrUndefined(files, 'Files argument');
    RequireRatchet.true(files.length > 0, 'Files argument larger than 0');
    RequireRatchet.notNullOrUndefined(inRootPath, 'Root path argument');
    Logger.info('Processing %d files into output', files.length);

    let allElements: any = {};
    for (const fName of files) {
      //for (let i = 0; i < files.length; i++) {
      const fileContents: string = fs.readFileSync(fName).toString();
      const openApi: any = yaml.load(fileContents);
      allElements = Object.assign(allElements, openApi);
    }
    const rootPath: string[] = Object.assign([], inRootPath);
    while (rootPath.length > 0) {
      const next: any = {};
      next[rootPath[rootPath.length - 1]] = allElements;
      rootPath.splice(rootPath.length - 1, 1);
      allElements = next;
    }

    const rval: string = yaml.dump(allElements);
    return rval;
  }
}
