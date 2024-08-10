import { ExportMapBuilderTargetConfig } from './export-map-builder-target-config.js';

export interface ExportMapBuilderConfig {
  sourceRoot?: string; // Folder, by default the folder src in the same folder as targetPackageJsonFile
  targets?: ExportMapBuilderTargetConfig[]; // Defaults to using folder lib, .js for imports, .d.ts for types
  includes?: RegExp[]; // If file, added, if folder, recursively descended.  Locations mapped from sourceRoot, defaults to .* if not set
  excludes?: RegExp[]; // Any file/folder matching isn't processed.  Defaults to empty
  targetPackageJsonFile?: string; // defaults to package.json at root
  dryRun?: boolean;
}
