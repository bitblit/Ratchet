import * as winston from 'winston';
import * as util from "util";

/**
 * Service to setup winson
 */
export class Logger {
    private static readonly LOGGER = Logger.createLogger();

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

    public static getRawLogger() : any
    {
        return Logger.LOGGER;
    }

    public static errorRaw(...input: any[]) : void
    {
        Logger.LOGGER.error(input);
    }

    public static warnRaw(...input: any[]) : void
    {
        Logger.LOGGER.warn(input);
    }

    public static infoRaw(...input: any[]) : void
    {
        Logger.LOGGER.info(input);
    }

    public static verboseRaw(...input: any[]) : void
    {
        Logger.LOGGER.verbose(input);
    }

    public static debugRaw(...input: any[]) : void
    {
        Logger.LOGGER.debug(input);
    }

    public static sillyRaw(...input: any[]) : void
    {
        Logger.LOGGER.silly(input);
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
