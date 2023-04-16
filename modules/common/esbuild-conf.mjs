import * as esbuild from 'esbuild'

import { polyfillNode } from "esbuild-plugin-polyfill-node";
import { globPlugin } from 'esbuild-plugin-glob';

await esbuild.build({
    entryPoints: ['src/**/*.ts'],
    bundle: true,
    format: 'esm',
    //outExtension: 'mjs',
    outdir: 'dist',
    //outfile: 'dist/out.mjs',
    plugins: [globPlugin(),polyfillNode()],
})