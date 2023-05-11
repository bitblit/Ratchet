// rollup.config.js

import typescript from '@rollup/plugin-typescript';

export default {
  input: './lib/index.js',
  output: {
    dir: 'lib/',
    format: 'esm',
  },
  plugins: [typescript()],
};
