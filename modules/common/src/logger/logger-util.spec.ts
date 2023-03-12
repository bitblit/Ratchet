import { LoggerUtil } from './logger-util';
import { LoggerLevelName } from './logger-level-name';

describe('#checkLevel', function () {
  it('should check that level logging works', function () {
    expect(LoggerUtil.levelIsEnabled(LoggerLevelName.info, LoggerLevelName.warn)).toEqual(false);
    expect(LoggerUtil.levelIsEnabled(LoggerLevelName.warn, LoggerLevelName.info)).toEqual(true);
    expect(LoggerUtil.levelIsEnabled(LoggerLevelName.warn, LoggerLevelName.warn)).toEqual(true);
  });
});
