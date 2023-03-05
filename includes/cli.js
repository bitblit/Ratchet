#!/usr/bin/env node
const RCH = require('../bundle/cjs');

RCH.RatchetCliHandler.findAndExecuteHandler()
  .then(() => {
    // Do nothing
  })
  .catch((err) => {
    RCH.Logger.error('Error : %s', err);
    process.exit(-1);
  });
