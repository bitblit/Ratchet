// rollup.config.js

//import typescript from 'rollup-plugin-typescript2';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { dts } from "rollup-plugin-dts";
import multiInput from 'rollup-plugin-multi-input';
const config = [{
  input: ['src/**/*.ts'], //'./src/index.ts',
  output: {
    dir: 'lib/',
    //file: 'tmp/index.mjs',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    multiInput(),
    //nodeResolve({ preferBuiltins: true, browser: true }),
    terser(),
    typescript(),
    //json(),
    //commonjs(),
    //nodePolyfills({ include: null, sourceMap: true }),
  ],
},
  /*
  {
    input: "./src/index.ts",
    output: [{ file: "tmp/types.d.ts", format: "es" }],
    plugins: [dts()],
  }*/
];

export default config