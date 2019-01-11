import {DurationRatchet} from './duration-ratchet';

/*
    Class to simplify timing
*/

export class StopWatch {
    public static readonly DEFAULT_TIMER_NAME: string = 'default';
    private starts: Map<string,number> = new Map<string,number>();
    private ends: Map<string,number> = new Map<string,number>();

    constructor(){}

    public start(name:string = StopWatch.DEFAULT_TIMER_NAME): number {
        const now: number = new Date().getTime();
        this.starts.set(name, now);
        return now;
    }

    public stop(name:string = StopWatch.DEFAULT_TIMER_NAME): number {
        const now: number = new Date().getTime();
        this.ends.set(name, now);
        return now;
    }

    public reset(name: string = StopWatch.DEFAULT_TIMER_NAME): void {
        this.starts.delete(name);
        this.ends.delete(name);
    }

    public dump(name: string = StopWatch.DEFAULT_TIMER_NAME, includeMS: boolean = true): string {
        let rval: string = 'No timer set for '+name;
        const start: number = this.starts.get(name);
        const end: number = this.ends.get(name);
        if (!!start && !!end) {
            rval = 'completed in '+DurationRatchet.formatMsDuration(end-start, includeMS);
        } else if (!!start) {
            rval= 'running for '+DurationRatchet.formatMsDuration(new Date().getTime() - start, includeMS);
        }
        return rval;
    }
}
