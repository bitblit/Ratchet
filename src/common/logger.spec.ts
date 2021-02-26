import { Logger } from './logger';
import { LogSnapshot } from './log-snapshot';
import { LogMessage } from './log-message';

describe('#levelName', function () {
  it('should return "error" for 0', function () {
    const result = Logger.levelName(0);
    expect(result).toEqual('error');
  });
  it('should return "warn" for 1', function () {
    const result = Logger.levelName(1);
    expect(result).toEqual('warn');
  });
  it('should return "info" for 2', function () {
    const result = Logger.levelName(2);
    expect(result).toEqual('info');
  });
  it('should return "verbose" for 3', function () {
    const result = Logger.levelName(3);
    expect(result).toEqual('verbose');
  });
  it('should return "debug" for 4', function () {
    const result = Logger.levelName(4);
    expect(result).toEqual('debug');
  });
  it('should return "silly" for 5', function () {
    const result = Logger.levelName(5);
    expect(result).toEqual('silly');
  });
});

describe('#levelColor', function () {
  it('should return "#F00" for 0', function () {
    const result = Logger.levelColor(0);
    expect(result).toEqual('#F00');
  });
  it('should return "#FF0" for 1', function () {
    const result = Logger.levelColor(1);
    expect(result).toEqual('#FF0');
  });
  it('should return "#0F0" for 2', function () {
    const result = Logger.levelColor(2);
    expect(result).toEqual('#0F0');
  });
  it('should return "#0EF" for 3', function () {
    const result = Logger.levelColor(3);
    expect(result).toEqual('#0EF');
  });
  it('should return "#F0F" for 4', function () {
    const result = Logger.levelColor(4);
    expect(result).toEqual('#F0F');
  });
  it('should return "#000" for 5', function () {
    const result = Logger.levelColor(5);
    expect(result).toEqual('#000');
  });
  it('should return "#000" for -7', function () {
    const result = Logger.levelColor(-7);
    expect(result).toEqual('#000');
  });
  it('should return "#000" for null', function () {
    const result = Logger.levelColor(null);
    expect(result).toEqual('#000');
  });
});

describe('#setLevelByName', function () {
  it('should change the level to debug then info then debug', function () {
    Logger.dumpConfigurationIntoLog();
    //console.log("Start Level : "+Logger.getLevel());
    expect(Logger.getLevel()).toEqual('info');
    // Should start at default level
    Logger.setLevelByName('debug');
    expect(Logger.getLevel()).toEqual('debug');
    Logger.setLevelByName('info');
    expect(Logger.getLevel()).toEqual('info');
    //Logger.debug("This should NOT get written, as I am at info level");
    //Logger.info("This should get written, as I am at info level");
    //Logger.logByLevel('info', "Write at info level");
    //Logger.info("Write also at info level");
    Logger.setLevelByName('debug');
    expect(Logger.getLevel()).toEqual('debug');
  });
});

describe('#setLevelColorByName', function () {
  it('should change the color of the silly level to white', function () {
    const idx: number = Logger.levelNumber('silly');
    expect(idx).toBeTruthy();
    expect(Logger.levelColor(idx)).toEqual('#000');
    Logger.setLevelColorByName('silly', '#FFF');
    expect(Logger.levelColor(idx)).toEqual('#FFF');
  });
});

describe('#takeSnapshot', function () {
  it('should advance the pointer correctly after a snapshot', function () {
    Logger.setRingBufferSize(5);
    expect(Logger.getRingBufferIdx()).toEqual(1);

    Logger.info('m1');
    Logger.info('m2');
    Logger.info('m3');

    const snap1: LogSnapshot = Logger.takeSnapshot();
    Logger.info('m4');
    Logger.info('m5');
    const snap2: LogSnapshot = Logger.takeSnapshot();

    Logger.info('m6');
    Logger.info('m7');
    Logger.info('m8');

    const snap3: LogSnapshot = Logger.takeSnapshot();

    expect(snap1.messages.length).toEqual(4);
    expect(snap2.messages.length).toEqual(2);
    expect(snap3.messages.length).toEqual(3);

    expect(Logger.getRingBufferIdx()).toEqual(9);
  });
});

describe('#testTracePrefix', function () {
  it('should apply a trace prefix correctly', function () {
    Logger.setTracePrefix('::TRACE::');
    Logger.setRingBufferSize(3);
    Logger.info('m1');
    Logger.info('m2');
    const snap1: LogSnapshot = Logger.takeSnapshot();

    expect(snap1.messages.length).toBeGreaterThan(0);
    snap1.messages.forEach((m) => {
      expect(m.msg.indexOf('::TRACE::')).toBeGreaterThan(-1);
    });

    Logger.setTracePrefix(null);
    Logger.info('m1');
    Logger.info('m2');
    const snap2: LogSnapshot = Logger.takeSnapshot();

    expect(snap2.messages.length).toBeGreaterThan(0);
    snap2.messages.forEach((m) => {
      expect(m.msg.indexOf('::TRACE::')).toEqual(-1);
    });
  });
});

describe('#testLastMessage', function () {
  it('should return the last message', function () {
    Logger.info('m1');
    Logger.info('m2');

    const last: LogMessage = Logger.getLastLogMessage();
    expect(last).toBeTruthy();
    expect(last.lvl).toEqual(Logger.levelNumber('info'));
    expect(last.msg.endsWith('m2')).toBeTruthy();
  });
});

describe('#testPassThruFunctions', function () {
  it('should pass through values', function () {
    Logger.setLevelByName('debug');

    Logger.error('Test %s', 'tVal');
    Logger.errorP('TestP %s', 'tVal');
    Logger.errorP('TestP 2', 27, { some: 'Object' });

    Logger.warn('Test %s', 'tVal');
    Logger.warnP('TestP %s', 'tVal');

    Logger.info('Test %s', 'tVal');
    Logger.infoP('TestP %s', 'tVal');

    Logger.debug('Test %s', 'tVal');
    Logger.debugP('TestP %s', 'tVal');

    // These shouldnt run
    Logger.verbose('Test %s', 'tVal');
    Logger.verboseP('TestP %s', 'tVal');

    Logger.silly('Test %s', 'tVal');
    Logger.sillyP('TestP %s', 'tVal');

    Logger.setLevelByName('debug');
  });
});
