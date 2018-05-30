import * as util from "util";
import {LogMessage} from "./log-message";
import {LogSnapshot} from "./log-snapshot";

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
    public static readonly DEFAULT_LEVEL : string = 'info';
    public static readonly LEVEL_NAMES : string[] = ['error','warn','info','verbose','debug','silly'];
    public static readonly LEVEL_COLORS : string[] = ['#F00','#FF0','#0F0','#0EF','#F0F','#000'];

    private static timeAdjustmentInMs : number = 0;
    private static ringBufferSize : number = 0;
    private static ringBuffer : LogMessage[] = [];
    private static ringBufferIdx : number = 0;
    private static ringBufferLastSnapshotIdx : number = 0;

    private static level : number = Logger.levelNumber(Logger.DEFAULT_LEVEL);

    public static dumpConfigurationIntoLog() : void
    {
        Logger.error('ERROR enabled');
        Logger.warn('WARN enabled');
        Logger.info('INFO enabled');
        Logger.debug('DEBUG enabled');
        Logger.silly('SILLY enabled');
    }

    public static getLevel() : string
    {
        return Logger.levelName(Logger.level);
    }

    public static setLevelByName(newLevel: string) : void
    {
        let num : number = Logger.levelNumber(newLevel);
        if (num!=null)
        {
            Logger.level = num;
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
            Logger.level = newLevel;
        }
        else {
            Logger.error("Could not change level to %s - invalid number",newLevel);
        }

    }

    public static updateTimeAdjustment(newValueInMs: number) : void
    {
        Logger.timeAdjustmentInMs = (newValueInMs==null)?0:newValueInMs;
    }

    public static setRingBufferSize(newSize: number) : void
    {
        Logger.ringBufferSize = (newSize==null)?0:newSize;
        Logger.clearRingBuffer();
    }

    private static clearRingBuffer()
    {
        Logger.ringBuffer = [];
        Logger.ringBufferIdx = 0;
        Logger.info("Cleared ring buffer (size is now {})",Logger.ringBufferSize);
    }

    private static addToRingBuffer(message: string, level:string) : void
    {
        if (Logger.ringBufferSize>0)
        {
            let levNum = Logger.levelNumber(level);
            if (levNum!=null && levNum<=Logger.level)
            {
                Logger.ringBuffer[Logger.ringBufferIdx % Logger.ringBufferSize] = {
                    msg: message,
                    lvl: levNum,
                    timestamp: new Date().getTime()+Logger.timeAdjustmentInMs
                } as LogMessage;
                Logger.ringBufferIdx++; // advance
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

    public static getMessages(inStartFrom: number, clear:boolean = false) : LogMessage[]
    {
        let rval: LogMessage[] = null;
        if (Logger.ringBufferIdx < Logger.ringBufferSize) {
            rval = Logger.ringBuffer;
        }
        else {
            rval = [];

            const firstIdx = (Logger.ringBufferIdx - Logger.ringBufferSize);
            const startFrom = (inStartFrom) ? Math.max(inStartFrom, firstIdx) : firstIdx;

            for (let i = startFrom; i < Logger.ringBufferIdx; i++) {
                rval.push(Logger.ringBuffer[i % Logger.ringBufferSize]);
            }
        }

        if (clear)
        {
            Logger.clearRingBuffer();
        }

        return rval;
    }

    public static error(...input: any[]) : void
    {
        let msg : string = util.format.apply(null,input);
        if (Logger.level<=0)
        {
            console.error(msg);
            Logger.addToRingBuffer(msg,'error');
        }
    }

    public static warn(...input: any[]) : void
    {
        let msg : string = util.format.apply(null,input);
        if (Logger.level<=1)
        {
            console.warn(msg);
            Logger.addToRingBuffer(msg,'warn');
        }
    }

    public static info(...input: any[]) : void
    {
        let msg : string = util.format.apply(null,input);
        if (Logger.level<=2)
        {
            console.info(msg);
            Logger.addToRingBuffer(msg,'info');
        }
    }

    public static verbose(...input: any[]) : void
    {
        let msg : string = util.format.apply(null,input);
        if (Logger.level<=3)
        {
            console.info(msg);
            Logger.addToRingBuffer(msg,'verbose');
        }
    }

    public static debug(...input: any[]) : void
    {
        let msg : string = util.format.apply(null,input);
        if (Logger.level<=4)
        {
            console.debug(msg);
            Logger.addToRingBuffer(msg,'debug');
        }
    }

    public static silly(...input: any[]) : void
    {
        let msg : string = util.format.apply(null,input);
        if (Logger.level<=5)
        {
            console.log(msg);
            Logger.addToRingBuffer(msg,'silly');
        }
    }

    public static takeSnapshot(): LogSnapshot {
        const trailingEdge = Math.max(0, Logger.ringBufferIdx - Logger.ringBufferSize);
        const rval: LogSnapshot = {
            messages : Logger.getMessages(Logger.ringBufferLastSnapshotIdx),
            logMessagesTruncated : Math.max(0, trailingEdge - Logger.ringBufferLastSnapshotIdx)
        } as LogSnapshot;

        Logger.ringBufferLastSnapshotIdx = Logger.ringBufferIdx;
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

}
