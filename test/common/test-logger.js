"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var logger_1 = require("../../src/common/logger");
describe('#levelName', function () {
    it('should return "error" for 0', function () {
        var result = logger_1.Logger.levelName(0);
        chai_1.expect(result).to.equal('error');
    });
    it('should return "warn" for 1', function () {
        var result = logger_1.Logger.levelName(1);
        chai_1.expect(result).to.equal('warn');
    });
    it('should return "info" for 2', function () {
        var result = logger_1.Logger.levelName(2);
        chai_1.expect(result).to.equal('info');
    });
    it('should return "verbose" for 3', function () {
        var result = logger_1.Logger.levelName(3);
        chai_1.expect(result).to.equal('verbose');
    });
    it('should return "debug" for 4', function () {
        var result = logger_1.Logger.levelName(4);
        chai_1.expect(result).to.equal('debug');
    });
    it('should return "silly" for 5', function () {
        var result = logger_1.Logger.levelName(5);
        chai_1.expect(result).to.equal('silly');
    });
});
describe('#levelColor', function () {
    it('should return "#F00" for 0', function () {
        var result = logger_1.Logger.levelColor(0);
        chai_1.expect(result).to.equal('#F00');
    });
    it('should return "#FF0" for 1', function () {
        var result = logger_1.Logger.levelColor(1);
        chai_1.expect(result).to.equal('#FF0');
    });
    it('should return "#0F0" for 2', function () {
        var result = logger_1.Logger.levelColor(2);
        chai_1.expect(result).to.equal('#0F0');
    });
    it('should return "#0EF" for 3', function () {
        var result = logger_1.Logger.levelColor(3);
        chai_1.expect(result).to.equal('#0EF');
    });
    it('should return "#F0F" for 4', function () {
        var result = logger_1.Logger.levelColor(4);
        chai_1.expect(result).to.equal('#F0F');
    });
    it('should return "#000" for 5', function () {
        var result = logger_1.Logger.levelColor(5);
        chai_1.expect(result).to.equal('#000');
    });
    it('should return "#000" for -7', function () {
        var result = logger_1.Logger.levelColor(-7);
        chai_1.expect(result).to.equal('#000');
    });
    it('should return "#000" for null', function () {
        var result = logger_1.Logger.levelColor(null);
        chai_1.expect(result).to.equal('#000');
    });
});
describe('#setLevelByName', function () {
    it('should change the level to debug then info then debug', function () {
        logger_1.Logger.dumpConfigurationIntoLog();
        //console.log("Start Level : "+Logger.getLevel());
        chai_1.expect(logger_1.Logger.getLevel()).to.equal('info');
        // Should start at default level
        logger_1.Logger.setLevelByName('debug');
        chai_1.expect(logger_1.Logger.getLevel()).to.equal('debug');
        logger_1.Logger.setLevelByName('info');
        chai_1.expect(logger_1.Logger.getLevel()).to.equal('info');
        //Logger.debug("This should NOT get written, as I am at info level");
        //Logger.info("This should get written, as I am at info level");
        //Logger.logByLevel('info', "Write at info level");
        //Logger.info("Write also at info level");
        logger_1.Logger.setLevelByName('debug');
        chai_1.expect(logger_1.Logger.getLevel()).to.equal('debug');
    });
});
describe('#setLevelColorByName', function () {
    it('should change the color of the silly level to white', function () {
        var idx = logger_1.Logger.levelNumber('silly');
        chai_1.expect(idx).to.not.be.null;
        chai_1.expect(logger_1.Logger.levelColor(idx)).to.equal('#000');
        logger_1.Logger.setLevelColorByName('silly', "#FFF");
        chai_1.expect(logger_1.Logger.levelColor(idx)).to.equal('#FFF');
    });
});
describe('#takeSnapshot', function () {
    it('should advance the pointer correctly after a snapshot', function () {
        logger_1.Logger.setRingBufferSize(5);
        chai_1.expect(logger_1.Logger.getRingBufferIdx()).to.equal(1);
        logger_1.Logger.info("m1");
        logger_1.Logger.info("m2");
        logger_1.Logger.info("m3");
        var snap1 = logger_1.Logger.takeSnapshot();
        logger_1.Logger.info("m4");
        logger_1.Logger.info("m5");
        var snap2 = logger_1.Logger.takeSnapshot();
        logger_1.Logger.info("m6");
        logger_1.Logger.info("m7");
        logger_1.Logger.info("m8");
        var snap3 = logger_1.Logger.takeSnapshot();
        chai_1.expect(snap1.messages.length).to.equal(4);
        chai_1.expect(snap2.messages.length).to.equal(2);
        chai_1.expect(snap3.messages.length).to.equal(3);
        chai_1.expect(logger_1.Logger.getRingBufferIdx()).to.equal(9);
    });
});
