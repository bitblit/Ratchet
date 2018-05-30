import { expect } from 'chai';
import {Logger} from "../../src/common/logger";

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


