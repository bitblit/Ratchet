import {Writable} from 'stream';

export class StringWritable extends Writable {
  private _val: string = '';

  constructor() {
    super();
  }

  _write(chunk: any, encoding: string, callback): void {
    this._val += chunk ? chunk.toString() : '';
    callback();
  }

  public get value(): string {
    return this._val;
  }
}
