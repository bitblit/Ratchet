import * as util from "util";
import {LogMessage} from "./log-message";
import {LogSnapshot} from "./log-snapshot";
import moment = require('moment');

/**
 * Service to setup winston, and also adds ring buffer capability if so desired.
 * Also allows setting an adjustment for more precise timestamps (on the ring buffer)
 *
 *
 * Important note : This class is here to make logging SIMPLE - it does 2 things, logging to console
 * and storage in a ring buffer.  If you need to do something more complicated (like logging to files,
 * multiple transports, etc) you really should just use winston directly and skip this class entirely
 */
export class Logger {
    public static readonly LEVEL_NAMES : string[] = ['error','warn','info','verbose','debug','silly'];
    public static readonly DEFAULT_LEVEL_COLORS : string[] = ['#F00','#FF0','#0F0','#0EF','#F0F','#000'];

    private static LEVEL_COLORS : string[] = Logger.DEFAULT_LEVEL_COLORS.slice(); // Start as a copy of the defaults

    private static CONSOLE_LOGGING_ENABLED: boolean = true;
    private static TRACE_PREFIX: string = null;

    private static TIME_ADJUSTMENT_IN_MS : number = 0;
    private static RING_BUFFER_SIZE : number = 0;
    private static RING_BUFFER : LogMessage[] = [];
    private static RING_BUFFER_IDX : number = 0;
    private static RING_BUFFER_LAST_SNAPSHOT_IDX : number = 0;

    private static LEVEL : number = 2; // INFO
    private static INCLUDE_LEVEL_IN_MESSAGE: boolean = true;

    public static dumpConfigurationIntoLog() : void
    {
        Logger.error('ERROR enabled');
        Logger.warn('WARN enabled');
        Logger.info('INFO enabled');
        Logger.verbose('VERBOSE enabled');
        Logger.debug('DEBUG enabled');
        Logger.silly('SILLY enabled');
    }

    public static setIncludeLevelInMessage(newVal: boolean) : void {
        this.INCLUDE_LEVEL_IN_MESSAGE = newVal;
    }

    public static getRingBufferIdx() : number
    {
        return this.RING_BUFFER_IDX;
    }

    static getRingBufferLastSnapshotIdx() {
        return Logger.RING_BUFFER_LAST_SNAPSHOT_IDX;
    }

    public static getLevel() : string
    {
        return Logger.levelName(Logger.LEVEL);
    }

    public static setLevelColorByName(levelName:string, newColor:string) : void{
        let idx : number = Logger.levelNumber(levelName);
        if (!levelName || !newColor)
        {
            throw Error('Cannot set color with null name or color');
        }
        if (idx!=null)
        {
            Logger.LEVEL_COLORS[idx]=newColor;
        }
    }

    public static setLevelByName(newLevel: string) : void
    {
        let num : number = Logger.levelNumber(newLevel);
        if (num!=null)
        {
            Logger.LEVEL = num;
        }
        else
        {
            Logger.error("Could not change level to %s - invalid name",newLevel);
        }
    }

    public static setLevelByNumber(newLevel: number) : void
    {
        if (newLevel>=0 && newLevel<Logger.LEVEL_NAMES.length)
        {
            Logger.LEVEL = newLevel;
        }
        else {
            Logger.error("Could not change level to %s - invalid number",newLevel);
        }

    }

    public static isConsoleLoggingEnabled(): boolean {
        return Logger.CONSOLE_LOGGING_ENABLED;
    }

    public static setConsoleLoggingEnabled(newValue: boolean) : void
    {
        Logger.CONSOLE_LOGGING_ENABLED = newValue;
    }

    public static getTracePrefix(): string {
        return Logger.TRACE_PREFIX;
    }

    public static setTracePrefix(newValue: string) : void {
        Logger.TRACE_PREFIX = newValue;
    }

    public static updateTimeAdjustment(newValueInMs: number) : void
    {
        Logger.TIME_ADJUSTMENT_IN_MS = (newValueInMs==null)?0:newValueInMs;
    }

    public static setRingBufferSize(newSize: number) : void
    {
        Logger.RING_BUFFER_SIZE = (newSize==null)?0:newSize;
        Logger.clearRingBuffer();
    }

    private static clearRingBuffer()
    {
        Logger.RING_BUFFER = [];
        Logger.RING_BUFFER_IDX = 0;
        Logger.RING_BUFFER_LAST_SNAPSHOT_IDX = 0;
        Logger.info("Cleared ring buffer (size is now %d)",Logger.RING_BUFFER_SIZE);
    }

    private static addToRingBuffer(message: string, level:string) : void
    {
        if (Logger.RING_BUFFER_SIZE>0)
        {
            let levNum = Logger.levelNumber(level);
            if (levNum!=null && levNum<=Logger.LEVEL)
            {
                Logger.RING_BUFFER[Logger.RING_BUFFER_IDX % Logger.RING_BUFFER_SIZE] = {
                    msg: message,
                    lvl: levNum,
                    timestamp: new Date().getTime()+Logger.TIME_ADJUSTMENT_IN_MS
                } as LogMessage;
                Logger.RING_BUFFER_IDX++; // advance
            }
        }
    }

    public static levelNumber(name: string) : number {
        let num = Logger.LEVEL_NAMES.indexOf(name);
        return (num==-1)?null:num;
    }


    public static levelName(idx: number) : string {
        return (idx!=null && idx>=0 && idx<Logger.LEVEL_NAMES.length)?Logger.LEVEL_NAMES[idx]:null;
    }

    public static levelColor(idx: number) {
        return (idx!=null && idx>=0 && idx<Logger.LEVEL_COLORS.length)?Logger.LEVEL_COLORS[idx]:'#000';
    }

    public static getMessages(inStartFrom: number = null, clear:boolean = false, reverseSort: boolean = false) : LogMessage[]
    {
        let rval: LogMessage[] = null;
        if (Logger.RING_BUFFER_IDX < Logger.RING_BUFFER_SIZE) {
            const start:number = (inStartFrom==null)?0:inStartFrom;
            rval = Logger.RING_BUFFER.slice(start, Logger.RING_BUFFER_IDX); // Use slice to get a copy (should use below too)
        }
        else {
            rval = [];

            const firstIdx = (Logger.RING_BUFFER_IDX - Logger.RING_BUFFER_SIZE);
            const startFrom = (inStartFrom) ? Math.max(inStartFrom, firstIdx) : firstIdx;

            for (let i = startFrom; i < Logger.RING_BUFFER_IDX; i++) {
                rval.push(Logger.RING_BUFFER[i % Logger.RING_BUFFER_SIZE]);
            }
        }

        if (clear)
        {
            Logger.clearRingBuffer();
        }

        if (reverseSort)
        {
            rval = rval.reverse();
        }

        return rval;
    }

    private static conditionallyApplyLevelAndPrefixToMessage(lvl: number, msg: string) : string {
        const tmp: string = (Logger.TRACE_PREFIX) ?  Logger.TRACE_PREFIX + msg : msg;
        return (Logger.INCLUDE_LEVEL_IN_MESSAGE) ? '[' + Logger.levelName(lvl) + '] ' + tmp : tmp;
    }

    private static ifConsoleLoggingEnabled(callback: Function, message: any): void {
        if (Logger.CONSOLE_LOGGING_ENABLED) {
            callback(message);
        }
    }

    public static error(...input: any[]) : void
    {
        let msg : string = util.format.apply(null,input);
        msg = Logger.conditionallyApplyLevelAndPrefixToMessage(0,msg);
        if (Logger.LEVEL>=0)
        {
            Logger.ifConsoleLoggingEnabled(console.error, msg);
            Logger.addToRingBuffer(msg,'error');
        }
    }

    public static warn(...input: any[]) : void
    {
        let msg : string = util.format.apply(null,input);
        msg = Logger.conditionallyApplyLevelAndPrefixToMessage(1,msg);
        if (Logger.LEVEL>=1)
        {
            Logger.ifConsoleLoggingEnabled(console.warn, msg);
            Logger.addToRingBuffer(msg,'warn');
        }
    }

    public static info(...input: any[]) : void
    {
        let msg : string = util.format.apply(null,input);
        msg = Logger.conditionallyApplyLevelAndPrefixToMessage(2,msg);
        if (Logger.LEVEL>=2)
        {
            Logger.ifConsoleLoggingEnabled(console.info, msg);
            Logger.addToRingBuffer(msg,'info');
        }
    }

    public static verbose(...input: any[]) : void
    {
        let msg : string = util.format.apply(null,input);
        msg = Logger.conditionallyApplyLevelAndPrefixToMessage(3,msg);
        if (Logger.LEVEL>=3)
        {
            Logger.ifConsoleLoggingEnabled(console.info, msg);
            Logger.addToRingBuffer(msg,'verbose');
        }
    }

    public static debug(...input: any[]) : void
    {
        let msg : string = util.format.apply(null,input);
        msg = Logger.conditionallyApplyLevelAndPrefixToMessage(4,msg);
        if (Logger.LEVEL>=4)
        {
            // This is here because old versions of Node do not support console.debug
            if (console.debug)
            {
                Logger.ifConsoleLoggingEnabled(console.debug, msg);
            }
            else
            {
                Logger.ifConsoleLoggingEnabled(console.log, msg);
            }

            Logger.addToRingBuffer(msg,'debug');
        }
    }

    public static silly(...input: any[]) : void
    {
        let msg : string = util.format.apply(null,input);
        msg = Logger.conditionallyApplyLevelAndPrefixToMessage(5,msg);
        if (Logger.LEVEL>=5)
        {
            Logger.ifConsoleLoggingEnabled(console.log, msg);
            Logger.addToRingBuffer(msg,'silly');
        }
    }

    public static takeSnapshot(): LogSnapshot {
        const trailingEdge = Math.max(0, Logger.RING_BUFFER_IDX - Logger.RING_BUFFER_SIZE);
        const rval: LogSnapshot = {
            messages : Logger.getMessages(Logger.RING_BUFFER_LAST_SNAPSHOT_IDX),
            logMessagesTruncated : Math.max(0, trailingEdge - Logger.RING_BUFFER_LAST_SNAPSHOT_IDX)
        } as LogSnapshot;

        Logger.RING_BUFFER_LAST_SNAPSHOT_IDX = Logger.RING_BUFFER_IDX;
        return rval;
    }

    public static logByLevel(level: string, ...input:any[]) : void
    {
        let num : number = Logger.levelNumber(level);
        if (num!=null)
        {
            let msg : string = util.format.apply(null,input);
            switch (num)
            {
                case 0 : Logger.error(msg);break;
                case 1 : Logger.warn(msg);break;
                case 2 : Logger.info(msg);break;
                case 3 : Logger.verbose(msg);break;
                case 4 : Logger.debug(msg);break;
                case 5 : Logger.silly(msg);break;
                default : console.log("Cant happen, level was "+num);break;
            }
        }
        else
        {
            Logger.error("Cannot log at level %s - invalid level",level);
        }

    }


    public static importMessages(msgs:LogMessage[], prefixIn:string = '', addTimestamp: boolean = true) : void
    {
        const prefix:string = prefixIn || '';
        if (msgs && msgs.length>0) {
            Logger.silly("Received monitor data : %d msgs",msgs.length);

            // Pump messages
            msgs.forEach(m => {
                if (m.msg)
                {
                    let mOut: string = prefix;
                    if (addTimestamp) {
                        const ts: string = moment(m.timestamp).format('hh:mm:ss');
                        mOut += ' (' + ts + ') : ';
                        mOut += m.msg;
                    }
                    Logger.logByLevel(Logger.levelName(m.lvl),mOut);
                }
            });
        }
    }

}
