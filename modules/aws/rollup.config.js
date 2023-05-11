// rollup.config.js

import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: './src/index.ts',
  output: {
    dir: 'lib/',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [nodeResolve({ preferBuilins: true }), terser(), json(), typescript(), commonjs()],
};
