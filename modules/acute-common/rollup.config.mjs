import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import angular from 'rollup-plugin-angular';
import  terser  from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import pkg from './package.json' assert { type: 'json' };

export default {
  input: 'src/index.ts', // Entry point for your library
  output: [
    {
      file: pkg.main,  // Output for CommonJS
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: pkg.module,  // Output for ESModule
      format: 'es',
      sourcemap: true,
    },
    {
      file: pkg.browser,  // UMD output for browsers
      format: 'umd',
      name: 'AcuteCommon',
      globals: {
        '@angular/core': 'ng.core',
        '@angular/common': 'ng.common',
        '@angular/forms': 'ng.forms',
        '@angular/animations': 'ng.animations',
        'rxjs': 'rxjs',
      },
      sourcemap: true,
    }
  ],
  external: ['@angular/core', '@angular/common', "@angular/compiler",
    "@angular/forms",
    "@angular/platform-browser",
    "@angular/platform-browser-dynamic",
    "@bitblit/ratchet-common",
    "primeflex",
    "primeicons",
    "primeng",
    "zone.js",'rxjs'],  // Externals, you don’t bundle Angular and RxJS
  plugins: [
    resolve({
      browser: true, // Resolves third-party libraries in node_modules
    }),
    json(),
    commonjs(),  // Convert CommonJS modules to ES6
    angular(),   // Handles Angular HTML templates and styles
    typescript({  // Compile TypeScript
      tsconfig: './tsconfig.json',
    }),
    terser(),    // Minify the bundle
  ]
};
