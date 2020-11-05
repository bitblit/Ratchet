/*
    Some useful transforms for the transform ratchet
*/

import { TransformRule } from './transform-rule';
import { Logger } from '../logger';
import * as moment from 'moment';
import { NumberRatchet } from '../number-ratchet';

export class BuiltInTransforms {
  public static keysOnly(rule: TransformRule): TransformRule {
    return {
      transform(value: any, isKey: boolean, context: any): any {
        return isKey ? rule.transform(value, isKey, context) : value;
      },
    } as TransformRule;
  }

  public static valuesOnly(rule: TransformRule): TransformRule {
    return {
      transform(value: any, isKey: boolean, context: any): any {
        return !isKey ? rule.transform(value, isKey, context) : value;
      },
    } as TransformRule;
  }

  public static stringReplaceTransform(input: string, output: string): TransformRule {
    return {
      transform(value: any, isKey: boolean, context: any): any {
        return value == input ? output : value;
      },
    } as TransformRule;
  }

  public static stripStringTransform(input: string): TransformRule {
    return {
      transform(value: any, isKey: boolean, context: any): any {
        return value == input ? null : value;
      },
    } as TransformRule;
  }

  public static retainAll(input: string[]): TransformRule {
    return {
      transform(value: any, isKey: boolean, context: any): any {
        return input.indexOf(value) == -1 ? null : value;
      },
    } as TransformRule;
  }

  public static removeAll(input: string[]): TransformRule {
    return {
      transform(value: any, isKey: boolean, context: any): any {
        return input.indexOf(value) > -1 ? null : value;
      },
    } as TransformRule;
  }

  public static snakeToCamelCase(): TransformRule {
    return {
      transform(value: any, isKey: boolean, context: any): any {
        let rval = value;
        if (typeof value == 'string') {
          // Taken, mainly, from https://stackoverflow.com/questions/4969605/javascript-regexp-to-camelcase-a-hyphened-css-property
          rval = value.replace(/_([a-z0-9])/gi, function (s, group1) {
            return group1.toUpperCase();
          });
        }
        return rval;
      },
    } as TransformRule;
  }

  public static stringToNumber(): TransformRule {
    return {
      transform(value: any, isKey: boolean, context: any): any {
        let rval = value;
        if (typeof value == 'string') {
          const num: number = NumberRatchet.safeNumber(value);
          if (num !== null) {
            rval = num;
          }
        }
        return rval;
      },
    } as TransformRule;
  }

  public static camelToSnakeCase(): TransformRule {
    return {
      transform(value: any, isKey: boolean, context: any): any {
        let rval = value;
        if (typeof value == 'string') {
          // https://stackoverflow.com/questions/30521224/javascript-convert-pascalcase-to-underscore-case
          rval = value
            .replace(/\.?([A-Z]+)/g, function (x, y) {
              return '_' + y.toLowerCase();
            })
            .replace(/^_/, '');
        }
        return rval;
      },
    } as TransformRule;
  }

  public static concatenateToNewField(
    newFieldName: string,
    oldFieldNamesInOrder: string[],
    abortIfFieldMissing: boolean = true
  ): TransformRule {
    return {
      transform(value: any, isKey: boolean, context: any): any {
        if (typeof value == 'object') {
          let rval = '';
          oldFieldNamesInOrder.forEach((n) => {
            if (rval != null) {
              const temp = value[n];
              if (temp == null && abortIfFieldMissing) {
                rval = null;
              } else {
                rval = temp == null ? rval : rval + String(temp);
              }
            }
          });
          if (rval != null) {
            value[newFieldName] = rval;
            oldFieldNamesInOrder.forEach((n) => delete value[n]);
          }
        }
        return value;
      },
    } as TransformRule;
  }

  public static numberToBool(fieldNames: string[]): TransformRule {
    return {
      transform(value: any, isKey: boolean, context: any): any {
        if (typeof value == 'object') {
          fieldNames.forEach((n) => {
            const oldVal = value[n];
            if (typeof oldVal == 'number') {
              const newVal = 0 != oldVal;
              value[n] = newVal;
            }
          });
        }
        return value;
      },
    } as TransformRule;
  }

  public static boolToNumber(fieldNames: string[]): TransformRule {
    return {
      transform(value: any, isKey: boolean, context: any): any {
        if (typeof value == 'object') {
          fieldNames.forEach((n) => {
            const oldVal = value[n];
            if (typeof oldVal == 'boolean') {
              const newVal = oldVal ? 1 : 0;
              value[n] = newVal;
            }
          });
        }
        return value;
      },
    } as TransformRule;
  }

  public static makeDuplicateField(oldName: string, newName: string): TransformRule {
    return {
      transform(value: any, isKey: boolean, context: any): any {
        if (typeof value == 'object') {
          const oldVal = value[oldName];
          if (oldVal != null) {
            value[newName] = oldVal;
          }
        }
        return value;
      },
    } as TransformRule;
  }

  public static addField(name: string, valueToAdd: string): TransformRule {
    return {
      transform(value: any, isKey: boolean, context: any): any {
        if (typeof value == 'object') {
          value[name] = valueToAdd;
        }
        return value;
      },
    } as TransformRule;
  }

  // Moment formats, https://momentjs.com/docs/#/parsing/
  public static reformatDateFields(fieldNames: string[], oldFormat: string, newFormat: string): TransformRule {
    return {
      transform(value: any, isKey: boolean, context: any): any {
        if (typeof value == 'object') {
          fieldNames.forEach((key) => {
            const oldValue = value[key];
            if (oldValue != null) {
              try {
                const parsed = moment(oldValue, oldFormat);
                const newValue = parsed.format(newFormat);
                value[key] = newValue;
              } catch (err) {
                Logger.warn('Failed to reparse date %s in format %s : %s', oldValue, oldFormat, err);
              }
            }
          });
        }
        return value;
      },
    } as TransformRule;
  }
}
