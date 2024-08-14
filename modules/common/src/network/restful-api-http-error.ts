import { NumberRatchet } from '../lang/number-ratchet.js';
import { StringRatchet } from "../lang/string-ratchet.js";

/**
 * 2023-07-18 : I moved this class from Epsilon over to common because 1) It has no
 * dependencies so it's a light lift and 2) unicorn showed me it is helpful to have
 * it available on the client side.
 *
 * This class is meant to provide a more robust and standardized error class for
 * throwing things across the http wire in restful apis.
 */
export class RestfulApiHttpError<T = void> extends Error {
  private static readonly RATCHET_RESTFUL_API_HTTP_ERROR_FLAG_KEY: string = '__ratchetRestfulApiHttpErrorFlag';
  private _httpStatusCode = 500;
  private _errors: string[];
  private _detailErrorCode: number;
  private _endUserErrors: string[];
  private _details: T;
  private _requestId: string;
  private _wrappedError: Error;

  constructor(...errors: string[]) {
    super(RestfulApiHttpError.combineErrorStringsWithDefault(errors));
    Object.setPrototypeOf(this, RestfulApiHttpError.prototype);
    this._errors = errors;
    this[RestfulApiHttpError.RATCHET_RESTFUL_API_HTTP_ERROR_FLAG_KEY] = true; // Just used to tell if one has been wrapped
  }

  public static combineErrorStringsWithDefault(errors: string[], defMessage = 'Internal Server Error'): string {
    return errors && errors.length > 0 ? errors.join(',') : defMessage;
  }

  public setFormattedErrorMessage(format: string, ...input: any[]): void {
    const msg: string = StringRatchet.format(format, ...input);
    this.errors = [msg];
  }

  public withFormattedErrorMessage(format: string, ...input: any[]): RestfulApiHttpError<T> {
    this.setFormattedErrorMessage(format, ...input);
    return this;
  }

  public withHttpStatusCode(httpStatusCode: number): RestfulApiHttpError<T> {
    this.httpStatusCode = httpStatusCode; // Call setter
    return this;
  }

  public withErrors(errors: string[]): RestfulApiHttpError<T> {
    this.errors = errors; // Call setter
    return this;
  }

  public withDetailErrorCode(detailErrorCode: number): RestfulApiHttpError<T> {
    this._detailErrorCode = detailErrorCode; // Call setter
    return this;
  }

  public withEndUserErrors(endUserErrors: string[]): RestfulApiHttpError<T> {
    this._endUserErrors = endUserErrors; // Call setter
    return this;
  }

  public withDetails(details: T): RestfulApiHttpError<T> {
    this._details = details; // Call setter
    return this;
  }

  public withRequestId(requestId: string): RestfulApiHttpError<T> {
    this._requestId = requestId; // Call setter
    return this;
  }

  public withWrappedError(err: Error): RestfulApiHttpError<T> {
    this._wrappedError = err; // Call setter
    return this;
  }

  public isWrappedError(): boolean {
    return !!this._wrappedError;
  }

  public static wrapError<T = void>(err: Error): RestfulApiHttpError<T> {
    let rval: RestfulApiHttpError<T> = null;
    if (RestfulApiHttpError.objectIsRestfulApiHttpError(err)) {
      rval = err as RestfulApiHttpError<T>;
    } else {
      rval = new RestfulApiHttpError<T>(err.message).withWrappedError(err).withHttpStatusCode(500);
    }
    return rval;
  }

  public static objectIsRestfulApiHttpError(obj: any): boolean {
    return obj && obj[RestfulApiHttpError.RATCHET_RESTFUL_API_HTTP_ERROR_FLAG_KEY] === true;
  }

  get httpStatusCode(): number {
    return this._httpStatusCode;
  }

  set httpStatusCode(value: number) {
    this._httpStatusCode = value || 500;
  }

  get errors(): string[] {
    return this._errors;
  }

  set errors(value: string[]) {
    this._errors = value || ['Internal Server Error'];
    this.message = RestfulApiHttpError.combineErrorStringsWithDefault(this._errors);
  }

  get detailErrorCode(): number {
    return this._detailErrorCode;
  }

  set detailErrorCode(value: number) {
    this._detailErrorCode = value;
  }

  get endUserErrors(): string[] {
    return this._endUserErrors;
  }

  set endUserErrors(value: string[]) {
    this._endUserErrors = value;
  }

  get details(): T {
    return this._details;
  }

  set details(value: T) {
    this._details = value;
  }

  get requestId(): string {
    return this._requestId;
  }

  set requestId(value: string) {
    this._requestId = value || 'MISSING';
  }

  get wrappedError(): Error {
    return this._wrappedError;
  }

  set wrappedError(value: Error) {
    this._wrappedError = value;
  }

  public static errorIsX0x(errIn: Error, xClass: number): boolean {
    let rval = false;
    if (errIn && RestfulApiHttpError.objectIsRestfulApiHttpError(errIn)) {
      const err: RestfulApiHttpError = errIn as RestfulApiHttpError;

      const val: number = NumberRatchet.safeNumber(err.httpStatusCode);
      const bot: number = xClass * 100;
      const top: number = bot + 99;
      rval = val >= bot && val <= top;
    }
    return rval;
  }

  public static errorIs40x(err: Error): boolean {
    return RestfulApiHttpError.errorIsX0x(err, 4);
  }

  public static errorIs50x(err: Error): boolean {
    return RestfulApiHttpError.errorIsX0x(err, 5);
  }
}
