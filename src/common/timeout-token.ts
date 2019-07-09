import {Logger} from './logger';

export class TimeoutToken {
    constructor(private title: string, private timeoutMS){}

    public writeToLog():void {
        Logger.warn('Timed out after %d ms waiting for results of %s', this.timeoutMS, this.title);
    }
}