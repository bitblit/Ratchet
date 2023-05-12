// rollup.config.js

import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import nativePlugin from 'rollup-plugin-natives';
export default {
  input: './src/index.ts',
  output: {
    //dir: 'lib/',
    file: 'lib/index.mjs',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    nodeResolve({ preferBuiltins: true }),
    terser(),
    json(),
    typescript(),
    commonjs(),
    nativePlugin({
      copyTo: '/lib/native',
      destDir: './native',
      sourcemap: true,
      targetEsm: true,
    }),
  ],
};
