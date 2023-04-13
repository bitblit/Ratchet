import { Readable, ReadableOptions } from 'stream';

export class MultiStream extends Readable {
  _object: any;

  constructor(object: any, options: ReadableOptions = {}) {
    super(object instanceof Buffer || typeof object === 'string' ? options : { objectMode: true });
    this._object = object;
  }

  _read() {
    this.push(this._object);
    this._object = null;
  }
}
