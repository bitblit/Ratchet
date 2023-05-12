#!/usr/bin/env node
import { RatchetCliHandler } from '../lib/index.mjs';

try {
  //const RatchetCliHandler = await import('../dist/cli-bootstrap/ratchet-cli-handler.js');
  await new RatchetCliHandler().findAndExecuteHandler();
} catch (err) {
  console.error('Error : %s', err);
  process.exit(-1);
}
