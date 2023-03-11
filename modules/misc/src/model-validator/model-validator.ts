import Validator from 'swagger-model-validator';
import yaml from 'js-yaml';
import { ErrorRatchet, Logger, MapRatchet } from '@bitblit/ratchet-common';

/**
 * Helper for validating endpoints
 */
export class ModelValidator {
  constructor(private allModels: any) {
    if (!allModels || Object.keys(allModels).length == 0) {
      ErrorRatchet.throwFormattedErr('Cannot create model validator, passed models was null/empty : %j', allModels);
    }
  }

  public static createFromYamlString(yamlString: string, rootPath: string[]): ModelValidator {
    const src: any = yaml.load(yamlString);
    const modelSrc: any = rootPath && rootPath.length > 0 ? MapRatchet.findValue(src, rootPath) : src;
    return ModelValidator.createFromParsedObject(modelSrc);
  }

  public static createFromParsedObject(parsedObject: any): ModelValidator {
    return new ModelValidator(parsedObject);
  }

  public get modelNames(): string[] {
    return Object.keys(this.allModels);
  }

  public addModel(modelName: string, model: any): void {
    this.allModels[modelName] = model;
  }

  public fetchModel(modelName: string): any {
    return this.allModels[modelName];
  }

  public validate(modelName: string, modelObject: any, emptyAllowed: boolean = false, extraPropertiesAllowed: boolean = true): string[] {
    let rval: string[] = [];
    Logger.silly('Validating model %s all definitions are : %j', modelName, this.allModels);

    const modelEmpty: boolean = !modelObject || Object.keys(modelObject).length === 0;
    if (modelEmpty) {
      if (!emptyAllowed) {
        rval.push('Empty / null object sent, but empty not allowed here');
      }
    } else {
      if (this.allModels && modelName && this.allModels[modelName]) {
        const validation = new Validator().validate(
          modelObject,
          this.allModels[modelName],
          this.allModels,
          emptyAllowed,
          extraPropertiesAllowed
        );

        if (validation.errorCount > 0) {
          rval = validation.errors.map((e) => e.message);
        }
      } else {
        rval = ['Model named "' + modelName + '" not present in schema'];
      }
    }
    return rval;
  }
}
