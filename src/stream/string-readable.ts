import { Readable } from 'stream';
import { ErrorRatchet, StringRatchet } from '../common';

export class StringReadable extends Readable {
  public static stringToReadable(input: string): Readable {
    const s: Readable = new Readable();
    if (input !== null && input !== undefined) {
      s.push(input);
    }
    s.push(null); // indicates end-of-file basically - the end of the stream
    return s;
  }

  public static stringToWebReadableStream(input: string): ReadableStream {
    if (typeof ReadableStream !== 'undefined') {
      ErrorRatchet.throwFormattedErr('ReadableStream not supported on this platform');
    }

    const rval: ReadableStream = new ReadableStream(
      {
        start(controller) {
          if (input) {
            controller.enqueue(input); // May as well write it all
          }
        },
        pull(controller) {
          // Do nothing, wrote all at creation
        },
        cancel(reason) {
          // Do nothing, wrote all at creation
        },
      },
      {
        highWaterMark: input ? input.length : null,
      }
    );
    return rval;
  }

  public static anyToStringReadable(input: any): Readable {
    return input === null || input === undefined
      ? StringReadable.stringToReadable(null)
      : StringReadable.stringToReadable(StringRatchet.safeString(input));
  }
}
