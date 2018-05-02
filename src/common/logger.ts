import * as winston from 'winston';
import * as util from "util";
import {LogMessage} from "./log-message";

/**
 * Service to setup winston, and also adds ring buffer capability if so desired.
 * Also allows setting an adjustment for more precise timestamps (on the ring buffer)
 */
export class Logger {
    private static readonly LOGGER = Logger.createLogger();
    private static timeAdjustmentInMs : number = 0;
    private static ringBufferSize : number = 0;
    private static ringBuffer : LogMessage[] = [];
    private static ringBufferIdx : number = 0;

    private static createLogger() : any{

        const logger = winston.createLogger({
            level: 'debug',
            format: winston.format.json(),
            transports: [
                new winston.transports.Console({
                    format: winston.format.simple()
                })
            ]
        });

        return logger;
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

    public static getRawLogger() : any
    {
        return Logger.LOGGER;
    }

    private static addToRingBuffer(message: string, level:string) : void
    {
        if (Logger.ringBufferSize>0)
        {
            if ( Logger.LOGGER.levels[Logger.LOGGER.level] >= Logger.LOGGER.levels[level] ) {
                Logger.ringBuffer[Logger.ringBufferIdx % Logger.ringBufferSize] = {
                    msg: message,
                    lvl: Logger.LOGGER.levels[level],
                    timestamp: new Date().getTime()+Logger.timeAdjustmentInMs
                } as LogMessage;
                Logger.ringBufferIdx++; // advance
            }
        }
    }

    public static levelNumber(name: string) : number {
        return Logger.LOGGER.levels[name];
    }


    public static levelName(idx: number) : string {
        debugger;
        let levels : {} = Logger.LOGGER.levels;
        let rval : string = 'err';
        Object.keys(levels).forEach(k=> {
            if (levels[k] == idx) {
                rval = k;
            }
        });
        return rval;
    }

    public static levelColor(idx: number) {
        switch (idx) {
            case 0 :
                return "#F00"; //"#F0F"; //error
            case 1 :
                return "#FF0";//"#F0F"; //warn
            case 2 :
                return "#0F0";//"#0EF"; //info
            case 3 :
                return "#0F0"; //http
            case 4 :
                return "#0EF";//"#FF0"; //verbose
            case 5 :
                return "#F0F"; //debug
            default :
                return "#000"; //silly (6) or other
        }
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
        Logger.LOGGER.error(util.format.apply(null,input));
    }

    public static warn(...input: any[]) : void
    {
        Logger.LOGGER.warn(util.format.apply(null,input));
    }

    public static info(...input: any[]) : void
    {
        Logger.LOGGER.info(util.format.apply(null,input));
    }

    public static verbose(...input: any[]) : void
    {
        Logger.LOGGER.verbose(util.format.apply(null,input));
    }

    public static debug(...input: any[]) : void
    {
        Logger.LOGGER.debug(util.format.apply(null,input));
    }

    public static silly(...input: any[]) : void
    {
        Logger.LOGGER.silly(util.format.apply(null,input));
    }
}
