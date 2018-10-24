import { expect } from 'chai';
import {Logger} from "../../src/common/logger";
import {LogSnapshot} from '../../src/common/log-snapshot';


describe('#levelName', function() {
    it('should return "error" for 0', function() {
        let result = Logger.levelName(0);
        expect(result).to.equal('error');
    });
    it('should return "warn" for 1', function() {
        let result = Logger.levelName(1);
        expect(result).to.equal('warn');
    });
    it('should return "info" for 2', function() {
        let result = Logger.levelName(2);
        expect(result).to.equal('info');
    });
    it('should return "verbose" for 3', function() {
        let result = Logger.levelName(3);
        expect(result).to.equal('verbose');
    });
    it('should return "debug" for 4', function() {
        let result = Logger.levelName(4);
        expect(result).to.equal('debug');
    });
    it('should return "silly" for 5', function() {
        let result = Logger.levelName(5);
        expect(result).to.equal('silly');
    });

});

describe('#levelColor', function() {
    it('should return "#F00" for 0', function() {
        let result = Logger.levelColor(0);
        expect(result).to.equal('#F00');
    });
    it('should return "#FF0" for 1', function() {
        let result = Logger.levelColor(1);
        expect(result).to.equal('#FF0');
    });
    it('should return "#0F0" for 2', function() {
        let result = Logger.levelColor(2);
        expect(result).to.equal('#0F0');
    });
    it('should return "#0EF" for 3', function() {
        let result = Logger.levelColor(3);
        expect(result).to.equal('#0EF');
    });
    it('should return "#F0F" for 4', function() {
        let result = Logger.levelColor(4);
        expect(result).to.equal('#F0F');
    });
    it('should return "#000" for 5', function() {
        let result = Logger.levelColor(5);
        expect(result).to.equal('#000');
    });
    it('should return "#000" for -7', function() {
        let result = Logger.levelColor(-7);
        expect(result).to.equal('#000');
    });
    it('should return "#000" for null', function() {
        let result = Logger.levelColor(null);
        expect(result).to.equal('#000');
    });

});

describe('#setLevelByName', function() {
    it('should change the level to debug then info then debug', function() {
        Logger.dumpConfigurationIntoLog();
        //console.log("Start Level : "+Logger.getLevel());
        expect(Logger.getLevel()).to.equal('info');
        // Should start at default level
        Logger.setLevelByName('debug');
        expect(Logger.getLevel()).to.equal('debug');
        Logger.setLevelByName('info');
        expect(Logger.getLevel()).to.equal('info');
        //Logger.debug("This should NOT get written, as I am at info level");
        //Logger.info("This should get written, as I am at info level");
        //Logger.logByLevel('info', "Write at info level");
        //Logger.info("Write also at info level");
        Logger.setLevelByName('debug');
        expect(Logger.getLevel()).to.equal('debug');
    });
});


describe('#setLevelColorByName', function() {
    it('should change the color of the silly level to white', function() {
        let idx : number = Logger.levelNumber('silly');
        expect(idx).to.not.be.null;
        expect(Logger.levelColor(idx)).to.equal('#000');
        Logger.setLevelColorByName('silly',"#FFF");
        expect(Logger.levelColor(idx)).to.equal('#FFF');
    });
});


describe('#takeSnapshot', function() {
    it('should advance the pointer correctly after a snapshot', function() {
        Logger.setRingBufferSize(5);
        expect(Logger.getRingBufferIdx()).to.equal(1);

        Logger.info("m1");
        Logger.info("m2");
        Logger.info("m3");

        const snap1:LogSnapshot = Logger.takeSnapshot();
        Logger.info("m4");
        Logger.info("m5");
        const snap2:LogSnapshot = Logger.takeSnapshot();

        Logger.info("m6");
        Logger.info("m7");
        Logger.info("m8");

        const snap3:LogSnapshot = Logger.takeSnapshot();

        expect(snap1.messages.length).to.equal(4);
        expect(snap2.messages.length).to.equal(2);
        expect(snap3.messages.length).to.equal(3);

        expect(Logger.getRingBufferIdx()).to.equal(9);
    });
});


describe('#testTracePrefix', function() {
    it('should apply a trace prefix correctly', function() {
        Logger.setTracePrefix('::TRACE::');
        Logger.setRingBufferSize(3);
        Logger.info("m1");
        Logger.info("m2");
        const snap1:LogSnapshot = Logger.takeSnapshot();

        expect(snap1.messages.length).to.be.greaterThan(0);
        snap1.messages.forEach(m => {
            expect(m.msg.indexOf('::TRACE::')).to.be.greaterThan(-1);
        });

        Logger.setTracePrefix(null);
        Logger.info("m1");
        Logger.info("m2");
        const snap2:LogSnapshot = Logger.takeSnapshot();

        expect(snap2.messages.length).to.be.greaterThan(0);
        snap2.messages.forEach(m => {
            expect(m.msg.indexOf('::TRACE::')).to.eq(-1);
        });
    });
});

