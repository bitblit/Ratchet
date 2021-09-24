/**
 * A helper for adding "spreaders" suffixes to keys to prevent hot key problems on indexes and
 * hash keys.
 *
 * If you need to, you can easily increase the buckets number later, but may NOT decrease it.  Increasing
 * spots is also hard (although I have an idea for implementing that later...)
 */
import { ErrorRatchet, RequireRatchet, StringRatchet } from '../common';

export class HashSpreader {
  private _allSlots: string[];

  /*
  Spots is how many locations to use, buckets is the number of unique strings to use, and the alphabet
   are the strings to use in the spreader.  Every element in the alphabet must be unique and alphanumeric.  If there
   are N items in the alphabet, then buckets must be less than N^spots

   The separator is placed between the source data and the spreader
   */
  constructor(
    private spots: number = 3,
    private buckets: number = 16,
    private separator: string = '_',
    private alphabet: string = '0123456789ABCDEF'
  ) {
    RequireRatchet.true(spots > 0, 'Spots must be larger than 0');
    RequireRatchet.true(buckets > 1, 'Buckets must be larger than 1');
    RequireRatchet.notNullOrUndefined(StringRatchet.trimToNull(alphabet), 'Alphabet may not be null or empty');
    RequireRatchet.true(StringRatchet.allUnique(alphabet), 'Alphabet must be unique');
    RequireRatchet.true(StringRatchet.stringContainsOnlyAlphanumeric(alphabet), 'Alphabet must be alphanumeric');
    const permutations: number = Math.pow(alphabet.length, spots);
    RequireRatchet.true(buckets < permutations, 'Buckets must be less than permutations (' + buckets + ' / ' + permutations + ')');
    RequireRatchet.notNullOrUndefined(StringRatchet.trimToNull(this.separator), 'Separator must be nonnull and nonempty');
    const allPerms: string[] = StringRatchet.allPermutationsOfLength(spots, alphabet);
    this._allSlots = allPerms.slice(0, buckets);
  }

  public get allBuckets(): string[] {
    return Object.assign([], this._allSlots);
  }

  public get randomBucket(): string {
    return this._allSlots[Math.floor(Math.random() * this.buckets)];
  }

  public allSpreadValues(input: string): string[] {
    RequireRatchet.notNullOrUndefined(StringRatchet.trimToNull(input), 'Cannot spread null/empty value');
    const rval: string[] = this._allSlots.map((s) => input + this.separator + s);
    return rval;
  }

  public allSpreadValuesForArray(inputs: string[]): string[] {
    RequireRatchet.true(inputs && inputs.length > 0, 'Cannot spread null/empty array');
    let rval: string[] = [];
    inputs.forEach((i) => {
      rval = rval.concat(this.allSpreadValues(i));
    });
    return rval;
  }

  public addSpreader(input: string): string {
    RequireRatchet.notNullOrUndefined(StringRatchet.trimToNull(input), 'Cannot spread null/empty value');
    return input + this.separator + this.randomBucket;
  }

  public extractBucket(input: string): string {
    RequireRatchet.notNullOrUndefined(StringRatchet.trimToNull(input), 'Cannot extract from null or empty value');
    const loc: number = input.length - this.spots;
    if (loc < 0 || input.charAt(loc) !== this.separator) {
      ErrorRatchet.throwFormattedErr(
        'Cannot extract bucket, not created by this spreader (missing %s at location %d)',
        this.separator,
        loc
      );
    }
    return input.substring(loc);
  }

  public removeBucket(input: string): string {
    RequireRatchet.notNullOrUndefined(StringRatchet.trimToNull(input), 'Cannot extract from null or empty value');
    const loc: number = input.length - this.spots;
    if (loc < 0 || input.charAt(loc) !== this.separator) {
      ErrorRatchet.throwFormattedErr('Cannot remove bucket, not created by this spreader (missing %s at location %d)', this.separator, loc);
    }
    return input.substring(0, loc);
  }
}
