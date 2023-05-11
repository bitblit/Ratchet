import * as esbuild from 'esbuild'

import { polyfillNode } from "esbuild-plugin-polyfill-node";
import { globPlugin } from 'esbuild-plugin-glob';

const sharedConfig = {
    entryPoints: ['src/index.ts'],
    bundle: true,
    sourcemap: true,
    minify: true,
    plugins: [globPlugin(),polyfillNode()],
};

/*
Not building... for now
await esbuild.build({
    ...sharedConfig,
    splitting: false, // for now
    platform: 'node', // for CJS
    outfile: "lib/index.cjs",
});

 */

await esbuild.build({
    ...sharedConfig,
    splitting: false, // for now
    outfile: "lib/index.js",
    //platform: 'browser', // for ESM
    format: "esm",
});

