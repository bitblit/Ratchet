#!/usr/bin/env node
//const RatchetCliHandler = require("node-only/cli/ratchet-cli-handler.js");

//const RatchetCliHandler = all.RatchetCliHandler;
import { RatchetCliHandler } from './node-only/cli/ratchet-cli-handler';

const handler = new RatchetCliHandler();
handler
  .findAndExecuteHandler()
  .then((out) => {
    console.log('Normal exit: ', out);
  })
  .catch((err) => {
    console.error('Error : %s', err);
    process.exit(-1);
  });
