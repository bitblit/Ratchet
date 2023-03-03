#!/usr/bin/env node

import { Logger } from '../common/logger';
import { CliRatchet } from '../node-only/common/cli-ratchet';
import { RatchetInfo } from '../build/ratchet-info';

const progArgs: string[] = CliRatchet.argsAfterCommand(['ratchet-print-version.js', 'ratchet-print-version']);
if (progArgs) {
  Logger.info('Ratchet version info : %j', RatchetInfo.fetchBuildInformation());
} else {
  // Ignore it - they weren't trying to run you
}
