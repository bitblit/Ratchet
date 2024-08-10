import { ErrorRatchet } from './error-ratchet.js';
import { StringRatchet } from './string-ratchet.js';
import { Uint8ArrayRatchet } from './uint-8-array-ratchet.js';

/**
 * This class is specifically for dealing with web streams, NOT
 * node streams (ie, ReadableStream and WriteableStream, NOT
 * Readable and Writeable, and CERTAINLY not the FS based streams)
 */
export class WebStreamRatchet {
  // Empty constructor prevents instantiation
   
  private constructor() {}

  public static async webReadableStreamToUint8Array(stream: ReadableStream): Promise<Uint8Array> {
    const out: Uint8Array[] = [];
    const writer: WritableStream = new WritableStream(
      {
        async write(chunk, controller): Promise<any> {
          if (typeof chunk === 'string') {
            out.push(StringRatchet.stringToUint8Array(chunk));
          } else {
            out.push(chunk);
          }

          return null;
        },
        abort(reason) {
          ErrorRatchet.throwFormattedErr('StringWebWritableStream failure : %s', reason);
        },
      },
      {
        highWaterMark: 3,
        size: () => 1,
      },
    );
    await stream.pipeTo(writer);
    return Uint8ArrayRatchet.mergeArrays(out);
  }
  public static async webReadableStreamToString(stream: ReadableStream): Promise<string> {
    const buf: Uint8Array = await WebStreamRatchet.webReadableStreamToUint8Array(stream);
    return new TextDecoder().decode(buf);
  }

  public static stringToWebReadableStream(input: string): ReadableStream {
    //if (typeof ReadableStream !== 'undefined') {
    //  ErrorRatchet.throwFormattedErr('ReadableStream not supported on this platform');
    // }

    const rval: ReadableStream = new ReadableStream<string>(
      {
        start(controller) {
          if (input) {
            controller.enqueue(input); // May as well write it all
          }
          controller.close();
          return null;
        },
      },
      {
        highWaterMark: input ? input.length : null,
      },
    );
    return rval;
  }
}
