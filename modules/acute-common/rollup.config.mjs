import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import angular from 'rollup-plugin-angular';
import  terser  from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import pkg from './package.json' assert { type: 'json' };
import angularAotPlugin from '@bitblit/ratchet-node-only/third-party/angular/angular-aot-rollup-plugin';

export default {
  input: 'src/index.ts', // Entry point for your library
  output: [
    {
      file: pkg.module,  // Output for ESModule
      format: 'esm',
      sourcemap: true,
    }
  ],
  external: ['@angular/core', '@angular/common', "@angular/compiler",
    "@angular/forms",
    "@angular/platform-browser",
    "@angular/platform-browser-dynamic",
    "@angular/router",
    "@bitblit/ratchet-common",
    "primeflex",
    "primeicons",
    "primeng",
    "zone.js",'rxjs'],  // Externals, you don’t bundle Angular and RxJS
  plugins: [
    //resolve({
    //  browser: true, // Resolves third-party libraries in node_modules
    //}),
    json(),
    angularAotPlugin(),
    //commonjs(),  // Convert CommonJS modules to ES6
    //angular(),   // Handles Angular HTML templates and styles
    typescript({  // Compile TypeScript
      tsconfig: './tsconfig.json',
    }),
    //terser(),    // Minify the bundle
  ]
};
