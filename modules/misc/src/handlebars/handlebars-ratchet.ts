import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { ErrorRatchet } from '@bitblit/ratchet-common/lang/error-ratchet';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import { NumberRatchet } from '@bitblit/ratchet-common/lang/number-ratchet';

export class HandlebarsRatchet {
  // Empty constructor prevents instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  // Disabling ban-types here because I really DO want to accept and function-like object here
  // eslint-disable-next-line @typescript-eslint/ban-types
  public static functionMap(): Record<string, Function> {
    return {
      eq: HandlebarsRatchet.equal,
      ne: HandlebarsRatchet.notEqual,
      lt: HandlebarsRatchet.lessThan,
      gt: HandlebarsRatchet.greaterThan,
      lte: HandlebarsRatchet.lessThanEqual,
      gte: HandlebarsRatchet.greaterThanEqual,
      and: HandlebarsRatchet.and,
      or: HandlebarsRatchet.or,
      formatBytes: HandlebarsRatchet.formatBytes,
      rpn: HandlebarsRatchet.reversePolishNotation,

      add: HandlebarsRatchet.add,
      sub: HandlebarsRatchet.sub,
      mul: HandlebarsRatchet.mul,
      div: HandlebarsRatchet.div,
      mod: HandlebarsRatchet.mod,
      maxNum: HandlebarsRatchet.maxNum,
      minNum: HandlebarsRatchet.minNum,
    };
  }

  public static registerAll(handlebars: any): void {
    handlebars.registerHelper(HandlebarsRatchet.functionMap());
  }

  public static add(v1: number, v2: number): number {
    return NumberRatchet.safeNumber(v1) + NumberRatchet.safeNumber(v2);
  }

  public static sub(v1: number, v2: number): number {
    return NumberRatchet.safeNumber(v1) - NumberRatchet.safeNumber(v2);
  }

  public static mul(v1: number, v2: number): number {
    return NumberRatchet.safeNumber(v1) * NumberRatchet.safeNumber(v2);
  }

  public static div(v1: number, v2: number): number {
    return NumberRatchet.safeNumber(v1) / NumberRatchet.safeNumber(v2);
  }

  public static mod(v1: number, v2: number): number {
    return NumberRatchet.safeNumber(v1) % NumberRatchet.safeNumber(v2);
  }

  public static equal(v1: any, v2: any): boolean {
    return v1 === v2;
  }

  public static notEqual(v1: any, v2: any): boolean {
    return v1 !== v2;
  }

  public static lessThan(v1: any, v2: any): boolean {
    return v1 < v2;
  }

  public static lessThanEqual(v1: any, v2: any): boolean {
    return v1 <= v2;
  }

  public static greaterThan(v1: any, v2: any): boolean {
    return v1 > v2;
  }

  public static greaterThanEqual(v1: any, v2: any): boolean {
    return v1 >= v2;
  }

  public static maxNum(...args: number[]): number {
    return Math.max(...args.slice(0, -1));
  }

  public static minNum(...args: number[]): number {
    return Math.min(...args.slice(0, -1));
  }

  public static and(...args: any[]): boolean {
    return Array.prototype.every.call(args, Boolean);
  }

  public static or(...args: any[]): boolean {
    return Array.prototype.slice.call(args, 0, -1).some(Boolean);
  }

  public static formatBytes(v1: number): string {
    return StringRatchet.formatBytes(v1);
  }

  /**
   * Soo... why have a implementation of reverse polish notation for Handlebars?  Well basically
   * because handlebars does not support doing math internally, and sometimes I want to be able
   * to do arbitrarily complex math inside my template, and even if I have functions like
   * add and div, I cannot do things like this in templates (usually):
   * add 5 (div 10 8)
   * because handlebars typically will not do the parens correctly.  So, when you use RPN, there
   * are no parenthesis, operation order is handled by the stack, so you can put pretty much anything
   * you want in here
   *
   * And spare me any lectures about the evils of ANY logic in templates... if you send them my way, I'll assume you
   * are someone who has spent your whole life working in a university system and never having to make a payroll
   * @param args
   */
  public static reversePolishNotation(...args: any[]): string {
    let rval: string = null;

    try {
      // Disabling ban-types here because I really DO want to accept and function-like object here
      // eslint-disable-next-line @typescript-eslint/ban-types
      const fns: Record<string, Function> = Object.assign({}, HandlebarsRatchet.functionMap());
      delete fns['formatBytes']; // Not a 2-function op

      const stack = [];
      // Skip the last value since it is a ref back to the function itself
      for (let i = 0; i < args.length - 1; i++) {
        const a = args[i];
        if (fns[a]) {
          if (stack.length > 1) {
            const op2: any = stack.pop();
            const op1: any = stack.pop();
            const res: any = fns[a](op1, op2, {}); // Add back in the last-place placeholder for any ...any f
            stack.push(res);
          } else {
            ErrorRatchet.throwFormattedErr('Cannot execute operation %s - not enough args', a);
          }
        } else {
          stack.push(a);
        }
      }
      rval = stack.pop();
    } catch (err) {
      Logger.error('Failed to execute RPN: %s', err, err);
      rval = ErrorRatchet.asErr(err)?.message || 'Failure';
    }
    return rval;
  }
}
