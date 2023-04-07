#!/usr/bin/env node
import { RatchetCliHandler } from '../dist/cli-bootstrap/ratchet-cli-handler.js';

new RatchetCliHandler()
  .findAndExecuteHandler()
  .then(() => {
    // Do nothing
  })
  .catch((err) => {
    console.error('Error : %s', err);
    process.exit(-1);
  });
