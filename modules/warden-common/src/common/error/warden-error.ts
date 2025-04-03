import { StringRatchet } from "@bitblit/ratchet-common/lang/string-ratchet";
import { WardenErrorCode } from "./warden-error-codes";

/**
 * This is the superclass for errors that can be thrown in the Warden system -
 * most aren't user-recoverable but some are or hold more data.
 * 
 * Big users of ratchet will notice similarities to WardenError which
 * are not accidental
 */
export class WardenError<T = void> extends Error {
  private static readonly WARDEN_ERROR_FLAG_KEY: string = '__wardenErrorFlag';
  private _errorCode: number;
  private _internalMessage: string;
  private _publicMessage: string;
  private _details: T;
  private _wrappedError: Error;

  constructor(code: number, internalMessage?: string, publicMessage?: string, wrapped?: Error, details?: T) {
    super(StringRatchet.trimToNull(internalMessage)??'Warden Security Error');
    this._errorCode = code;
    this._internalMessage = StringRatchet.trimToNull(internalMessage)??'Warden Security Error'
    this._publicMessage = StringRatchet.trimToNull(publicMessage) ?? this._internalMessage;
    this._details = details;
    this._wrappedError = wrapped;
    this[WardenError.WARDEN_ERROR_FLAG_KEY] = true; // Just used to tell if one has been wrapped
  }

  public withFormattedInternalErrorMessage(format: string, ...input: any[]): WardenError<T> {
    this.setFormattedInternalErrorMessage(format, ...input);
    return this;
  }

  public setFormattedInternalErrorMessage(format: string, ...input: any[]): void {
    const msg: string = StringRatchet.format(format, ...input);
    this._internalMessage = msg;
  }
  
  public withFormattedPublicErrorMessage(format: string, ...input: any[]): WardenError<T> {
    this.setFormattedPublicErrorMessage(format, ...input);
    return this;
  }

  public setFormattedPublicErrorMessage(format: string, ...input: any[]): void {
    const msg: string = StringRatchet.format(format, ...input);
    this._publicMessage = msg;
  }

  public withErrorCode(code: number): WardenError<T> {
    this.errorCode = code; // Call setter
    return this;
  }

  public withDetails(details: T): WardenError<T> {
    this._details = details; // Call setter
    return this;
  }

  public withWrappedError(err: Error): WardenError<T> {
    this._wrappedError = err; // Call setter
    return this;
  }

  public isWrappedError(): boolean {
    return !!this._wrappedError;
  }

  public static wrapError<T = void>(err: Error): WardenError<T> {
    let rval: WardenError<T> = null;
    if (WardenError.objectIsWardenError(err)) {
      rval = err as WardenError<T>;
    } else {
      rval = new WardenError<T>(WardenErrorCode.Unspecified).withWrappedError(err);
    }
    return rval;
  }

  public static objectIsWardenError(obj: any): boolean {
    return obj && obj[WardenError.WARDEN_ERROR_FLAG_KEY] === true;
  }

  get errorCode(): number {
    return this._errorCode;
  }

  set errorCode(value: number) {
    this._errorCode = value;
  }

  get publicMessage(): string {
    return this._publicMessage;
  }

  set publicMessage(value: string) {
    this._publicMessage = value;
  }

  get internalMessage(): string {
    return this._internalMessage;
  }

  set internalMessage(value: string) {
    this._internalMessage = value;
  }

  get details(): T {
    return this._details;
  }

  set details(value: T) {
    this._details = value;
  }

  get wrappedError(): Error {
    return this._wrappedError;
  }

  set wrappedError(value: Error) {
    this._wrappedError = value;
  }

}
