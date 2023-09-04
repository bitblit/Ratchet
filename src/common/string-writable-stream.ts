// Here since WritableStream is part of the Web API
export class StringWritableStream extends WritableStream {
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
