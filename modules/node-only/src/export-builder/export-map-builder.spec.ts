import path from "path";
//import { fileURLToPath, URL } from 'url';
//import { Logger } from '../../common/logger';
import { describe, expect, test } from "vitest";
import { ExportMapBuilder } from "./export-map-builder.js";
import { ExportMapBuilderConfig } from "./export-map-builder-config.js";
import { EsmRatchet } from "@bitblit/ratchet-common/lang/esm-ratchet";
import { Logger } from "@bitblit/ratchet-common/logger/logger";

const testDirname: string = path.join(EsmRatchet.fetchDirName(import.meta.url),'../../../common');

describe('#exportMapBuilder', function () {
  test('should build an export map', async () => {

    const cfg: ExportMapBuilderConfig = {
        targetPackageJsonFile: path.join(testDirname, 'package.json'),
      dryRun: true
    };
    const output: Record<string,any> = ExportMapBuilder.process(cfg);
    expect(output).not.toBeNull;
    Logger.info('Output: %j', output);
  });
});
