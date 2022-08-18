import { Logger } from './logger';
import { LogSnapshot } from './logger-support/log-snapshot';
import { LogMessage } from './logger-support/log-message';
import { LoggerLevelName } from './logger-support/logger-level-name';
import { LogMessageProcessor } from './logger-support/log-message-processor';
import { StringRatchet } from './string-ratchet';
import { LogMessageBuilder } from './logger-support/log-message-builder';
import { LogMessageFormatType } from './logger-support/log-message-format-type';

describe('#setLevel', function () {
  it('should change the level to debug then info then debug', function () {
    Logger.dumpConfigurationIntoLog();
    //console.log("Start Level : "+Logger.getLevel());
    expect(Logger.getLevel()).toEqual(LoggerLevelName.info);
    // Should start at default level
    Logger.setLevel(LoggerLevelName.debug);
    expect(Logger.getLevel()).toEqual(LoggerLevelName.debug);
    Logger.setLevel(LoggerLevelName.info);
    expect(Logger.getLevel()).toEqual(LoggerLevelName.info);
    //Logger.debug("This should NOT get written, as I am at info level");
    //Logger.info("This should get written, as I am at info level");
    //Logger.logByLevel('info', "Write at info level");
    //Logger.info("Write also at info level");
    Logger.setLevel(LoggerLevelName.debug);
    expect(Logger.getLevel()).toEqual(LoggerLevelName.debug);
  });
});

describe('#takeSnapshot', function () {
  it('should advance the pointer correctly after a snapshot', function () {
    Logger.changeRingBufferSize(5);
    expect(Logger.getRingBuffer().currentIndex).toEqual(0);

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

    expect(snap1.messages.length).toEqual(3);
    expect(snap2.messages.length).toEqual(2);
    expect(snap3.messages.length).toEqual(3);

    expect(Logger.getRingBuffer().currentIndex).toEqual(8);
  });
});

describe('#testTracePrefix', function () {
  it('should apply a trace prefix correctly', function () {
    Logger.updateTracePrefix('::TRACE::');
    Logger.changeRingBufferSize(3);
    Logger.info('m1');
    Logger.info('m2');
    const snap1: LogSnapshot = Logger.takeSnapshot();
    const snap1String: string[] = Logger.formatMessages(snap1.messages);

    expect(snap1String.length).toBeGreaterThan(0);
    snap1String.forEach((m) => {
      expect(m.indexOf('::TRACE::')).toBeGreaterThan(-1);
    });

    Logger.updateTracePrefix(null);
    Logger.info('m1');
    Logger.info('m2');
    const snap2: LogSnapshot = Logger.takeSnapshot();

    expect(snap2.messages.length).toBeGreaterThan(0);
    snap2.messages.forEach((m) => {
      expect(m.messageSource.indexOf('::TRACE::')).toEqual(-1);
    });
  });
});

describe('#testLastMessage', function () {
  it('should return the last message', function () {
    Logger.info('m1');
    Logger.info('m2');

    const last: LogMessage = Logger.getLastLogMessage();
    expect(last).toBeTruthy();
    expect(last.lvl).toEqual(LoggerLevelName.info);
    expect(last.messageSource.endsWith('m2')).toBeTruthy();
  });
});

describe('#testPassThruFunctions', function () {
  it('should pass through values', function () {
    Logger.setLevel(LoggerLevelName.debug);

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

    Logger.setLevel(LoggerLevelName.debug);
  });
});

describe('#testFormatter', function () {
  it('should format values', function () {
    const msg: LogMessage = {
      lvl: LoggerLevelName.info,
      timestamp: Date.now(),
      messageSource: 'Test %d %d',
      subsVars: [1, 2],
      params: {},
    };
    Logger.info('Test %d %d', 3, 4);
    const msgS: string = Logger.formatMessages([msg])[0];
    expect(msgS).toEqual('[info] Test 1 2');
  });
});

describe('#testPreProcessor', function () {
  it('should perform a preprocess', function () {
    const preProc: LogMessageProcessor = {
      process(msg: LogMessage): LogMessage {
        msg.messageSource = 'Preprocess';
        return msg;
      },
    };

    const output: string = Logger.getLogger(StringRatchet.createRandomHexString(4), { preProcessors: [preProc] }).info(
      'This is a test %s',
      'bob'
    );
    expect(output).toEqual('[info] Preprocess bob');
  });
});

describe('#testBuilder', function () {
  it('should use a builder', function () {
    const output: string = Logger.getLogger(StringRatchet.createRandomHexString(4)).recordMessageBuilder(
      new LogMessageBuilder(LoggerLevelName.warn, 'This is a test %s').subVars(['bob'])
    );
    expect(output).toEqual('[warn] This is a test bob');
  });
});

describe('#testStructured', function () {
  it('should use a structured logger', function () {
    const output: string = Logger.getLogger(StringRatchet.createRandomHexString(4), {
      formatType: LogMessageFormatType.StructuredJson,
    }).recordMessageBuilder(new LogMessageBuilder(LoggerLevelName.warn, 'This is a test %s').subVars(['bob']).p('a', 27));
    const parsed: any = JSON.parse(output);
    expect(parsed.msg).toEqual('This is a test bob');
    expect(parsed.logLevel).toEqual('warn');
    expect(parsed.a).toEqual(27);
  });
});
