import { ErrorRatchet, EsmRatchet, Logger, StringRatchet } from "@bitblit/ratchet-common";
import fs, { Stats } from "fs";
import path from "path";
import { CliRatchet } from "../cli/cli-ratchet.js";
import { ExportMapBuilderConfig } from "./export-map-builder-config";

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
        suffix: '.js'
      },
      {
        type: 'types',
        prefix: './lib',
        suffix: '.d.ts'
      }
    ];

    Logger.info('Using sourceRoot %s and targets %j', cfg.sourceRoot, cfg.targets);



    let rval: Record<string, any> = {};
    for (let i = 0; i < cfg.includes.length; i++) {
      ExportMapBuilder.processSingleFile(cfg.sourceRoot, cfg, rval);
    }

    return rval;
  }

  private static pathMatchesOneOfRegExp(fileName: string, reg: RegExp[]): boolean {
    let rval: boolean = false;
    if (StringRatchet.trimToNull(fileName) && reg.length>0) {
      rval = true;
    }
    return rval;
  }

  private static findExports(fileName: string): string[] {
    const text: string = StringRatchet.trimToEmpty(fs.readFileSync(fileName).toString());
    const words: string = text.split(/[ \t\n]+/);
    const exports: string[] = [];
    for (let i=0;i<words.length-2;i++) {
      if (words[i]==='export') {
        if (words[i+1]==='class' || words[i+1]==='interface') {
          let next: string = words[i+2];
          if (next.endsWith('{')) {
            next = next.substring(0,next.length-1); // String trailing
          }
          exports.push(next);
        } else if (words[i+1]==='default') {
          // TODO: handle default
        }
      }
    }

    return exports;
  }

  private static processSingleFile(fileName: string, cfg: ExportMapBuilderConfig, inRecord: Record<string,any>): Record<string, any> {
    let rval: Record<string, any> = Object.assign({}, inRecord ?? {});
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
            exports.forEach(s=>{
              if (inRecord[s]) {
                throw ErrorRatchet.fErr('Collision on name %s : %s vs %s', fileName, inRecord[s], s);
              } else {
                let subPath: string = fileName.substring(cfg.sourceRoot.length);
                subPath = subPath.split('\\').join('/'); // Package.json uses unix separators even on windows
                if (subPath.endsWith('.ts')) {
                  subPath = subPath.substring(0, subPath.length-3);
                }
                cfg.targets.forEach(tgt=>{
                  inRecord[tgt.type] = inRecord[tgt.type] ?? {};
                  const targetFileName: string = StringRatchet.trimToEmpty(tgt.prefix)+subPath +
                    StringRatchet.trimToEmpty(tgt.suffix);
                  inRecord[tgt.type][s] = targetFileName;
                });
              }
            })
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
      Logger.infoP('Usage: ratchet-export-builder');// {packageJsonFile}');
      return null;
    } else {
      const idx: number = CliRatchet.indexOfCommandArgument('export-builder');
      //const jsonFile: string = process.argv[idx + 1];

      const cfg: ExportMapBuilderConfig = {
        //targetPackageJsonFile: jsonFile
      };

      Logger.info(
        'Running ExportMapBuilder from command line arguments');

      return ExportMapBuilder.process(cfg);
    }
  }
}
