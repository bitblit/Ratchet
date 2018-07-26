"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("util");
/**
 * Service to setup winston, and also adds ring buffer capability if so desired.
 * Also allows setting an adjustment for more precise timestamps (on the ring buffer)
 *
 *
 * Important note : This class is here to make logging SIMPLE - it does 2 things, logging to console
 * and storage in a ring buffer.  If you need to do something more complicated (like logging to files,
 * multiple transports, etc) you really should just use winston directly and skip this class entirely
 */
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.dumpConfigurationIntoLog = function () {
        Logger.error('ERROR enabled');
        Logger.warn('WARN enabled');
        Logger.info('INFO enabled');
        Logger.verbose('VERBOSE enabled');
        Logger.debug('DEBUG enabled');
        Logger.silly('SILLY enabled');
    };
    Logger.getRingBufferIdx = function () {
        return this.ringBufferIdx;
    };
    Logger.getRingBufferLastSnapshotIdx = function () {
        return Logger.ringBufferLastSnapshotIdx;
    };
    Logger.getLevel = function () {
        return Logger.levelName(Logger.level);
    };
    Logger.setLevelColorByName = function (levelName, newColor) {
        var idx = Logger.levelNumber(levelName);
        if (!levelName || !newColor) {
            throw Error('Cannot set color with null name or color');
        }
        if (idx != null) {
            Logger.LEVEL_COLORS[idx] = newColor;
        }
    };
    Logger.setLevelByName = function (newLevel) {
        var num = Logger.levelNumber(newLevel);
        if (num != null) {
            Logger.level = num;
        }
        else {
            Logger.error("Could not change level to %s - invalid name", newLevel);
        }
    };
    Logger.setLevelByNumber = function (newLevel) {
        if (newLevel >= 0 && newLevel < Logger.LEVEL_NAMES.length) {
            Logger.level = newLevel;
        }
        else {
            Logger.error("Could not change level to %s - invalid number", newLevel);
        }
    };
    Logger.updateTimeAdjustment = function (newValueInMs) {
        Logger.timeAdjustmentInMs = (newValueInMs == null) ? 0 : newValueInMs;
    };
    Logger.setRingBufferSize = function (newSize) {
        Logger.ringBufferSize = (newSize == null) ? 0 : newSize;
        Logger.clearRingBuffer();
    };
    Logger.clearRingBuffer = function () {
        Logger.ringBuffer = [];
        Logger.ringBufferIdx = 0;
        Logger.info("Cleared ring buffer (size is now %d)", Logger.ringBufferSize);
    };
    Logger.addToRingBuffer = function (message, level) {
        if (Logger.ringBufferSize > 0) {
            var levNum = Logger.levelNumber(level);
            if (levNum != null && levNum <= Logger.level) {
                Logger.ringBuffer[Logger.ringBufferIdx % Logger.ringBufferSize] = {
                    msg: message,
                    lvl: levNum,
                    timestamp: new Date().getTime() + Logger.timeAdjustmentInMs
                };
                Logger.ringBufferIdx++; // advance
            }
        }
    };
    Logger.levelNumber = function (name) {
        var num = Logger.LEVEL_NAMES.indexOf(name);
        return (num == -1) ? null : num;
    };
    Logger.levelName = function (idx) {
        return (idx != null && idx >= 0 && idx < Logger.LEVEL_NAMES.length) ? Logger.LEVEL_NAMES[idx] : null;
    };
    Logger.levelColor = function (idx) {
        return (idx != null && idx >= 0 && idx < Logger.LEVEL_COLORS.length) ? Logger.LEVEL_COLORS[idx] : '#000';
    };
    Logger.getMessages = function (inStartFrom, clear, reverseSort) {
        if (inStartFrom === void 0) { inStartFrom = null; }
        if (clear === void 0) { clear = false; }
        if (reverseSort === void 0) { reverseSort = false; }
        var rval = null;
        if (Logger.ringBufferIdx < Logger.ringBufferSize) {
            var start = (inStartFrom == null) ? 0 : inStartFrom;
            rval = Logger.ringBuffer.slice(start, Logger.ringBufferIdx); // Use slice to get a copy (should use below too)
        }
        else {
            rval = [];
            var firstIdx = (Logger.ringBufferIdx - Logger.ringBufferSize);
            var startFrom = (inStartFrom) ? Math.max(inStartFrom, firstIdx) : firstIdx;
            for (var i = startFrom; i < Logger.ringBufferIdx; i++) {
                rval.push(Logger.ringBuffer[i % Logger.ringBufferSize]);
            }
        }
        if (clear) {
            Logger.clearRingBuffer();
        }
        if (reverseSort) {
            rval = rval.reverse();
        }
        return rval;
    };
    Logger.error = function () {
        var input = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            input[_i] = arguments[_i];
        }
        var msg = util.format.apply(null, input);
        if (Logger.level >= 0) {
            console.error(msg);
            Logger.addToRingBuffer(msg, 'error');
        }
    };
    Logger.warn = function () {
        var input = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            input[_i] = arguments[_i];
        }
        var msg = util.format.apply(null, input);
        if (Logger.level >= 1) {
            console.warn(msg);
            Logger.addToRingBuffer(msg, 'warn');
        }
    };
    Logger.info = function () {
        var input = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            input[_i] = arguments[_i];
        }
        var msg = util.format.apply(null, input);
        if (Logger.level >= 2) {
            console.info(msg);
            Logger.addToRingBuffer(msg, 'info');
        }
    };
    Logger.verbose = function () {
        var input = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            input[_i] = arguments[_i];
        }
        var msg = util.format.apply(null, input);
        if (Logger.level >= 3) {
            console.info(msg);
            Logger.addToRingBuffer(msg, 'verbose');
        }
    };
    Logger.debug = function () {
        var input = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            input[_i] = arguments[_i];
        }
        var msg = util.format.apply(null, input);
        if (Logger.level >= 4) {
            // This is here because old versions of Node do not support console.debug
            if (console.debug) {
                console.debug(msg);
            }
            else {
                console.log(msg);
            }
            Logger.addToRingBuffer(msg, 'debug');
        }
    };
    Logger.silly = function () {
        var input = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            input[_i] = arguments[_i];
        }
        var msg = util.format.apply(null, input);
        if (Logger.level >= 5) {
            console.log(msg);
            Logger.addToRingBuffer(msg, 'silly');
        }
    };
    Logger.takeSnapshot = function () {
        var trailingEdge = Math.max(0, Logger.ringBufferIdx - Logger.ringBufferSize);
        var rval = {
            messages: Logger.getMessages(Logger.ringBufferLastSnapshotIdx),
            logMessagesTruncated: Math.max(0, trailingEdge - Logger.ringBufferLastSnapshotIdx)
        };
        Logger.ringBufferLastSnapshotIdx = Logger.ringBufferIdx;
        return rval;
    };
    Logger.logByLevel = function (level) {
        var input = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            input[_i - 1] = arguments[_i];
        }
        var num = Logger.levelNumber(level);
        if (num != null) {
            var msg = util.format.apply(null, input);
            switch (num) {
                case 0:
                    Logger.error(msg);
                    break;
                case 1:
                    Logger.warn(msg);
                    break;
                case 2:
                    Logger.info(msg);
                    break;
                case 3:
                    Logger.verbose(msg);
                    break;
                case 4:
                    Logger.debug(msg);
                    break;
                case 5:
                    Logger.silly(msg);
                    break;
                default:
                    console.log("Cant happen, level was " + num);
                    break;
            }
        }
        else {
            Logger.error("Cannot log at level %s - invalid level", level);
        }
    };
    Logger.LEVEL_NAMES = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
    Logger.DEFAULT_LEVEL_COLORS = ['#F00', '#FF0', '#0F0', '#0EF', '#F0F', '#000'];
    Logger.LEVEL_COLORS = Logger.DEFAULT_LEVEL_COLORS.slice(); // Start as a copy of the defaults
    Logger.timeAdjustmentInMs = 0;
    Logger.ringBufferSize = 0;
    Logger.ringBuffer = [];
    Logger.ringBufferIdx = 0;
    Logger.ringBufferLastSnapshotIdx = 0;
    Logger.level = 2; // INFO
    return Logger;
}());
exports.Logger = Logger;
