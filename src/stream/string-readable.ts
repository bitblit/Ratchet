import { Readable } from 'stream';
import { ErrorRatchet } from '../common/error-ratchet';
import { StringRatchet } from '../common/string-ratchet';
import { Logger } from '../common/logger';

export class StringReadable extends Readable {
  public static async webReadableStreamToBuffer(stream: ReadableStream): Promise<Buffer> {
    const out: Uint8Array[] = [];
    const writer: WritableStream = new WritableStream(
      {
        async write(chunk, controller): Promise<any> {
          if (typeof chunk === 'string') {
            StringRatchet.stringToUint8Array(chunk);
          } else {
            out.push(chunk);
          }

          return null;
          /*const buffer = new ArrayBuffer(1);
            const view = new Uint8Array(buffer);
            view[0] = chunk;
            this._val.push(view);*/
        },
        abort(reason) {
          ErrorRatchet.throwFormattedErr('StringWebWritableStream failure : %s', reason);
        },
      },
      {
        highWaterMark: 3,
        size: () => 1,
      }
    );
    await stream.pipeTo(writer);
    return Buffer.concat(out);
  }
  public static async webReadableStreamToString(stream: ReadableStream): Promise<string> {
    const buf: Buffer = await StringReadable.webReadableStreamToBuffer(stream);
    return buf.toString();
  }

  public static stringToReadable(input: string): Readable {
    const s: Readable = new Readable();
    if (input !== null && input !== undefined) {
      s.push(input);
    }
    s.push(null); // indicates end-of-file basically - the end of the stream
    return s;
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
