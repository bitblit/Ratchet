#!/usr/bin/env node
const ALL_CJS = require('../dist/cjs');

new ALL_CJS.RatchetCliHandler()
  .findAndExecuteHandler()
  .then(() => {
    // Do nothing
  })
  .catch((err) => {
    console.error('Error : %s', err);
    process.exit(-1);
  });
