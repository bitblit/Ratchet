import { Readable, Writable } from 'stream';
import { StringRatchet } from "@bitblit/ratchet-common/lang/string-ratchet";

/**
 * This class is specifically dealing with node streams as opposed to web streams
 * (ie, Readable vs ReadableStream, Writeable vs WritableStream)
 * https://stackoverflow.com/questions/61232291/difference-between-web-streams-and-node-js-stream-apis
 *
 * This is the only class that supports conversion between the two since the web will be assumed
 * to not have access to the NodeJS classes, but Node DOES have access to the web classes
 */
export class NodeStreamRatchet {
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

  public static stringToReadable(input: string): Readable {
    return new Readable({
      read() {
        this.push(input);
        this.push(null);
      },
    });
  }

  public static anyToStringReadable(input: any): Readable {
    return input === null || input === undefined
      ? NodeStreamRatchet.stringToReadable(null)
      : NodeStreamRatchet.stringToReadable(StringRatchet.safeString(input));
  }

  // window.ReadableStream to Node.js Readable
  public static webReadableStreamToNodeReadable(rs: ReadableStream): Readable {
    const reader = rs.getReader();
    const out = new Readable();
    reader.read().then(async ({ value, done }) => {
      while (!done) {
        out.push(value);
        ({ done, value } = await reader.read());
      }
      out.push(null);
    });
    return out;
  }

  // window.WritableStream to Node.js Writable
  public static webWritableStreamToNodeWriteable(ws: WritableStream): Writable {
    const writer = ws.getWriter();
    const out = new Writable();
    out._write = (chunk, encoding, callback) => {
      writer.write(chunk);
      callback();
    };
    out._final = (callback) => {
      writer.close();
      callback();
    };
    return out;
  }
}
