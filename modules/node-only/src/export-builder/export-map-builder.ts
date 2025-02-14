import fs, { Stats } from 'fs';
import path from 'path';
import { CliRatchet } from '../cli/cli-ratchet.js';
import { ExportMapBuilderConfig } from './export-map-builder-config.js';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { EsmRatchet } from '@bitblit/ratchet-common/lang/esm-ratchet';
import { ErrorRatchet } from '@bitblit/ratchet-common/lang/error-ratchet';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';

export class ExportMapBuilder {
  public static process(cfg: ExportMapBuilderConfig): Record<string, any> {
    Logger.info('Building export map : %j', cfg);

    cfg.targetPackageJsonFile = cfg.targetPackageJsonFile ?? path.join(EsmRatchet.fetchDirName(import.meta.url), 'package.json');
    cfg.includes = cfg.includes ?? [new RegExp('.*')];
    cfg.excludes = cfg.excludes ?? [];

    if (!fs.statSync(cfg.targetPackageJsonFile).isFile()) {
      throw ErrorRatchet.fErr('targetPackageJsonFile: %s does not exist or is not a file', cfg.targetPackageJsonFile);
    }

    cfg.sourceRoot = cfg.sourceRoot ?? path.join(path.dirname(cfg.targetPackageJsonFile), 'src');
    if (!fs.statSync(cfg.sourceRoot).isDirectory()) {
      throw ErrorRatchet.fErr('sourceRoot: %s does not exist or is not a folder', cfg.sourceRoot);
    }
    cfg.targets = cfg.targets ?? [
      {
        type: 'import',
        prefix: './lib',
        suffix: '.js',
      },
      {
        type: 'types',
        prefix: './lib',
        suffix: '.d.ts',
      },
    ];

    Logger.info('Using sourceRoot %s and targets %j', cfg.sourceRoot, cfg.targets);
    const exports: Record<string, any> = {};
    // TODO: This cant be right can it?  need to actually use this
    for (const _f of cfg.includes) {
      ExportMapBuilder.processSingleFile(cfg.sourceRoot, cfg, exports);
    }

    // Parse package.json
    const parsedPackage: any = JSON.parse(fs.readFileSync(cfg.targetPackageJsonFile).toString());
    parsedPackage['exports'] = exports;

    if (cfg.dryRun) {
      Logger.info('DryRun : Would have updated package json to : \n%j', parsedPackage);
    } else {
      // Update here
      fs.writeFileSync(cfg.targetPackageJsonFile, JSON.stringify(parsedPackage, null, 2));
    }

    return exports;
  }

  private static pathMatchesOneOfRegExp(fileName: string, reg: RegExp[]): boolean {
    let rval: boolean = false;
    if (StringRatchet.trimToNull(fileName) && reg.length > 0) {
      rval = true;
    }
    return rval;
  }

  private static findExports(fileName: string): string[] {
    const text: string = StringRatchet.trimToEmpty(fs.readFileSync(fileName).toString());
    const words: string[] = text.split(/[ \t\n]+/);
    const exports: string[] = [];
    for (let i = 0; i < words.length - 2; i++) {
      if (words[i] === 'export') {
        if (words[i + 1] === 'class' || words[i + 1] === 'interface') {
          let next: string = words[i + 2];
          if (next.endsWith('{')) {
            next = next.substring(0, next.length - 1); // String trailing
          }
          if (next.indexOf('<') !== -1) {
            // Strip generics
            next = next.substring(0, next.indexOf('<'));
          }
          exports.push(next);
        } else if (words[i + 1] === 'default') {
          // TODO: handle default
        }
      }
    }

    return exports;
  }

  private static processSingleFile(fileName: string, cfg: ExportMapBuilderConfig, inRecord: Record<string, any>): Record<string, any> {
    const rval: Record<string, any> = Object.assign({}, inRecord ?? {});
    if (fs.existsSync(fileName)) {
      if (ExportMapBuilder.pathMatchesOneOfRegExp(fileName, cfg.includes)) {
        if (!ExportMapBuilder.pathMatchesOneOfRegExp(fileName, cfg.excludes)) {
          const stats: Stats = fs.statSync(fileName);
          if (stats.isDirectory()) {
            const contFiles: string[] = fs.readdirSync(fileName);
            Logger.info('Found %d files in %s to process', contFiles.length, fileName);
            contFiles.forEach((f) => ExportMapBuilder.processSingleFile(path.join(fileName, f), cfg, inRecord));
          } else if (stats.isFile()) {
            const exports: string[] = ExportMapBuilder.findExports(fileName);
            exports.forEach((s) => {
              if (inRecord[s]) {
                throw ErrorRatchet.fErr('Collision on name %s : %s vs %s', fileName, inRecord[s], s);
              } else {
                let subPath: string = fileName.substring(cfg.sourceRoot.length);
                subPath = subPath.split('\\').join('/'); // Package.json uses unix separators even on windows
                if (subPath.endsWith('.ts')) {
                  subPath = subPath.substring(0, subPath.length - 3);
                }
                cfg.targets.forEach((tgt) => {
                  inRecord[s] = inRecord[s] || {};
                  const targetFileName: string = StringRatchet.trimToEmpty(tgt.prefix) + subPath + StringRatchet.trimToEmpty(tgt.suffix);
                  inRecord[s][tgt.type] = targetFileName;
                });
              }
            });
          } else {
            Logger.error('Skipping - neither file nor directory : %s', fileName);
          }
        } else {
          Logger.error('Skipping - fails exclude check : %s', fileName);
        }
      } else {
        Logger.error('Skipping - fails include check : %s', fileName);
      }
    } else {
      Logger.warn('Could not find file %s', fileName);
    }
    return rval;
  }

  /**
   And, in case you are running this command line...
   TODO: should use switches to allow setting the various non-filename params
   **/
  public static async runFromCliArgs(args: string[]): Promise<Record<string, any>> {
    if (args.length < 3) {
      Logger.infoP('Usage: ratchet-export-builder'); // {packageJsonFile}');
      return null;
    } else {
      const _idx: number = CliRatchet.indexOfCommandArgument('export-builder');
      //const jsonFile: string = process.argv[idx + 1];

      const cfg: ExportMapBuilderConfig = {
        //targetPackageJsonFile: jsonFile
      };

      Logger.info('Running ExportMapBuilder from command line arguments');

      return ExportMapBuilder.process(cfg);
    }
  }
}
