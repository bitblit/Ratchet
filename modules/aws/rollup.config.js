// rollup.config.js

import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
//import nodePolyfills from 'rollup-plugin-polyfill-node';;

export default {
  input: './src/index.ts',
  output: {
    //dir: 'lib/',
    file: 'lib/index.mjs',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    nodeResolve({ preferBuiltins: true, browser: true }),
    terser(),
    json(),
    typescript(),
    commonjs(),
    //nodePolyfills({ include: null, sourceMap: true }),
  ],
};
