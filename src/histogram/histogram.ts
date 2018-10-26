import {HistogramEntry} from './histogram-entry';

/**
 * Implements a simple histogram (for each object, how many times does it appear)
 */
export class Histogram<T> {
    private entries: HistogramEntry<T>[] = [];

    public update(val: T, addValue: number = 1): void {
        if (val) {
            const entry: HistogramEntry<T> = this.entries.find(e => e.item === val);
            if (entry) {
                entry.count += addValue;
            } else {
                this.entries.push({
                    item: val,
                    count: addValue
                } as HistogramEntry<T>)
            }
        }
    }

    public sort(): void {
        this.entries.sort((a, b) => {
            let rval: number = b.count - a.count;
            if (rval === 0) {
                rval = String(b.item).localeCompare(String(a.item));
            }
            return rval;
        })
    }

    // No need for second level sort, since the same key can only be in there once
    public sortKeys(): void {
        this.entries.sort((a, b) => String(b.item).localeCompare(String(a.item)));
    }

    public reverse(): void {
        this.entries.reverse();
    }

    public getEntries(): HistogramEntry<T>[] {
        return this.entries;
    }

    public getTotalCount(): number {
        let rval: number = 0;
        this.entries.forEach(h => rval += h.count);
        return rval;
    }

    public countForValue(val: T): number {
        const entry: HistogramEntry<T> = this.entries.find(test => test.item === val);
        return (entry) ? entry.count : 0;
    }

    public percentForValue(val: T): number {
        const total: number = this.getTotalCount();
        return (total === 0) ? 0 : this.countForValue(val) / total;
    }

}

