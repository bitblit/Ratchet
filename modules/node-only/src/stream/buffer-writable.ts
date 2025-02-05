import { Writable } from 'stream';

export class BufferWritable extends Writable {
  private _val: any[] = [];

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
