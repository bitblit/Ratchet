import { Writable } from 'stream';

// Both Buffer and Writeable are node-only
export class BufferWritable extends Writable {
  private _val: any[] = [];

  constructor() {
    super();
  }

  _write(chunk: any, encoding: string, callback): void {
    if (chunk) {
      this._val.push(chunk);
    }
    callback();
  }

  public get value(): Buffer {
    return Buffer.concat(this._val);
  }
}
