import { LoggerUtil } from './logger-util.js';
import { LoggerLevelName } from './logger-level-name.js';
import { describe, expect, test } from 'vitest';

describe('#checkLevel', function () {
  test('should check that level logging works', function () {
    expect(LoggerUtil.levelIsEnabled(LoggerLevelName.info, LoggerLevelName.warn)).toEqual(false);
    expect(LoggerUtil.levelIsEnabled(LoggerLevelName.warn, LoggerLevelName.info)).toEqual(true);
    expect(LoggerUtil.levelIsEnabled(LoggerLevelName.warn, LoggerLevelName.warn)).toEqual(true);
  });
});
