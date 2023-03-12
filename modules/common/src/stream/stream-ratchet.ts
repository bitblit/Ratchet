import { Readable } from 'stream';
import { ErrorRatchet } from '../lang/error-ratchet';
import { StringRatchet } from '../lang/string-ratchet';

export class StreamRatchet {
  // Empty constructor prevents instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static readableToBufferSync(stream: Readable): Buffer {
    const bufs = [];
    let next: any = stream.read();
    while (next) {
      bufs.push(next);
      next = stream.read();
    }
    return Buffer.concat(bufs);
  }

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
    const buf: Buffer = await StreamRatchet.webReadableStreamToBuffer(stream);
    return buf.toString();
  }

  public static stringToReadable(input: string): Readable {
    return new Readable({
      read() {
        this.push(input);
        this.push(null);
      },
    });
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
      ? StreamRatchet.stringToReadable(null)
      : StreamRatchet.stringToReadable(StringRatchet.safeString(input));
  }
}
