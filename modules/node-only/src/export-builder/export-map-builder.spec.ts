import path from "path";
import { EsmRatchet, Logger } from "@bitblit/ratchet-common";
//import { fileURLToPath, URL } from 'url';
//import { Logger } from '../../common/logger';
import { describe, expect, test } from "vitest";
import { ExportMapBuilder } from "./export-map-builder";
import { ExportMapBuilderConfig } from "./export-map-builder-config";

const testDirname: string = path.join(EsmRatchet.fetchDirName(import.meta.url),'../..');

describe('#exportMapBuilder', function () {
  test('should build an export map', async () => {

    const cfg: ExportMapBuilderConfig = {
        targetPackageJsonFile: path.join(testDirname, 'package.json')
    };
    const output: Record<string,any> = ExportMapBuilder.process(cfg);
    expect(output).not.toBeNull;
    Logger.info('Output: %j', output);
  });
});
