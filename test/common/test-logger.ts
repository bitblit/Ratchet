import { expect } from 'chai';
import { DurationRatchet } from "../../src/common/duration-ratchet";
import {StringRatchet} from "../../src/common/string-ratchet";
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
    it('should return "http" for 3', function() {
        let result = Logger.levelName(3);
        expect(result).to.equal('http');
    });
    it('should return "verbose" for 4', function() {
        let result = Logger.levelName(4);
        expect(result).to.equal('verbose');
    });
    it('should return "debug" for 5', function() {
        let result = Logger.levelName(5);
        expect(result).to.equal('debug');
    });
    it('should return "silly" for 6', function() {
        let result = Logger.levelName(6);
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
    it('should return "#0F0" for 3', function() {
        let result = Logger.levelColor(3);
        expect(result).to.equal('#0F0');
    });
    it('should return "#0EF" for 4', function() {
        let result = Logger.levelColor(4);
        expect(result).to.equal('#0EF');
    });
    it('should return "#F0F" for 5', function() {
        let result = Logger.levelColor(5);
        expect(result).to.equal('#F0F');
    });
    it('should return "#000" for 6', function() {
        let result = Logger.levelColor(6);
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
