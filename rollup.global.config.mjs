// rollup.config.js

import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { dts } from "rollup-plugin-dts";

const config = [{
  input: './src/index.ts',
  output: {
    //dir: 'lib/',
    file: 'tmp/index.mjs',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    //nodeResolve({ preferBuiltins: true, browser: true }),
    terser(),
    //json(),
    typescript(),
    //commonjs(),
    //nodePolyfills({ include: null, sourceMap: true }),
  ],
},
  {
    input: "./src/index.ts",
    output: [{ file: "tmp/types.d.ts", format: "es" }],
    plugins: [dts()],
  }
];

export default config