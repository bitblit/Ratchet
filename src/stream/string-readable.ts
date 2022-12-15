import { Readable } from 'stream';
import { StringRatchet } from '../common';

export class StringReadable extends Readable {
  public static stringToReadable(input: string): Readable {
    const s: Readable = new Readable();
    if (input !== null && input !== undefined) {
      s.push(input);
    }
    s.push(null); // indicates end-of-file basically - the end of the stream
    return s;
  }

  public static anyToStringReadable(input: any): Readable {
    return input === null || input === undefined
      ? StringReadable.stringToReadable(null)
      : StringReadable.stringToReadable(StringRatchet.safeString(input));
  }
}
