/** Classes implementing this interface return a timestamp of their last success **/
import {LastSuccessProvider} from './last-success-provider';

export class CompositeLastSuccessProvider implements LastSuccessProvider {
    private sources: LastSuccessProvider[];
    private mostRecent: boolean;

    constructor(src: LastSuccessProvider[], mostRecentSrc: boolean = true) {
        if (!src || src.length == 0) {
            throw Error('Cannot create composite provider with null/empty sources');
        }
        this.sources = src;
        this.mostRecent = mostRecentSrc;
    }

    public lastSuccess(): number {
        let rval: number = null;
        this.sources.forEach(s => {
            let val: number = s.lastSuccess();
            if (val != null) {
                if (rval == null) {
                    rval = val;
                }
                else {
                    rval = ((val > rval && this.mostRecent) || (val < rval && !this.mostRecent)) ? val : rval;
                }
            }
        });
        return rval;
    }
}