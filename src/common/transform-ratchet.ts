/*
    Functions for working with maps (dictionaries/objects in javascript)

    For each entry:
    1) Apply to key
    2) If the key is now null, skip it, else:
    2a) If the value is an array or map, recursively descend it
    2b) Apply to value
    3) If the value is now null, skip it.  Else, put into new result

*/

import { TransformRule } from './transform/transform-rule';
import { Logger } from './logger';

export class TransformRatchet {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static transform(toTransform: any, rules: TransformRule[] = []): any {
    return TransformRatchet.transformGeneric(toTransform, rules, false, null);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  private static transformGeneric(toTransform: any, rules: TransformRule[] = [], isKey: boolean, context: any): any {
    let rval: any = null;
    const type: string = typeof toTransform;
    switch (type) {
      case 'undefined':
      case 'symbol':
      case 'function':
        rval = toTransform;
        break;
      case 'number':
      case 'string':
      case 'boolean':
        rval = TransformRatchet.applyTransformToPrimitive(toTransform, rules, isKey, context);
        break;
      case 'object':
        rval = TransformRatchet.applyTransformToObject(toTransform, rules, isKey, context);
        break;
      default:
        throw new Error('Unrecognized type ' + type);
    }
    return rval;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  private static applyTransformToObject(toTransform: any, rules: TransformRule[] = [], isKey: boolean, context: any = null) {
    Logger.silly('Tranform: %j, %s, %j', toTransform, isKey, context);
    let rval: any = null;
    if (toTransform != null) {
      if (Array.isArray(toTransform)) {
        rval = [];
        toTransform.forEach((val) => {
          const newVal = TransformRatchet.transformGeneric(val, rules, isKey, toTransform);
          if (newVal != null) {
            rval.push(newVal);
          }
        });
      } else {
        // Its a complex object
        rval = {};
        Object.keys(toTransform).forEach((k) => {
          // First, transform the key
          const oldValue = toTransform[k];
          const newKey = TransformRatchet.applyTransformToPrimitive(k, rules, true, toTransform);
          if (newKey != null) {
            // Recursively descend first
            let newValue = TransformRatchet.transformGeneric(oldValue, rules, false, toTransform);
            // Then apply to the object as a whole
            newValue = TransformRatchet.applyTransformToPrimitive(newValue, rules, false, toTransform);

            if (newValue != null) {
              rval[newKey] = newValue;
            }
          }
        });
        // Finally, apply to the object itself
        rval = TransformRatchet.applyTransformToPrimitive(rval, rules, false, toTransform);
      }
    }
    return rval;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  private static applyTransformToPrimitive(toTransform: any, rules: TransformRule[] = [], isKey: boolean, context: any) {
    let rval: any = toTransform;
    rules.forEach((r) => {
      rval = rval == null ? null : r.transform(rval, isKey, context);
    });
    return rval;
  }
}
