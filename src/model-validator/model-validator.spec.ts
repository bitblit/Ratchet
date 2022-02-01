import {ModelValidator} from './model-validator';
import {Logger} from "../common/logger";
import TestData from '../static/test-data/sample_objects_spec_yaml.json';


describe('#modelValidator', function () {
  it('should list an error', function () {
    //const yamlString: string = fs.readFileSync(path.join(EsmModuleRatchet.fetchModuleRootDirName(), '../../test-data/sample-objects.spec.yaml')).toString();
    const validator: ModelValidator = ModelValidator.createFromYamlString(TestData, ['ModelObjects']);

    const shouldPass: any = {
      numberField: 7,
      stringField: 'xxx',
    };

    const shouldFail: any = {
      numberField: 70,
      stringField: 'xxx',
    };

    const errShouldPass: string[] = validator.validate('SimpleItem', shouldPass, false, true);
    const errShouldFail: string[] = validator.validate('SimpleItem', shouldFail, false, true);

    Logger.silly('shouldPass: %j', errShouldPass);
    Logger.silly('shouldFail: %j', errShouldFail);

    expect(errShouldPass).toBeTruthy();
    expect(errShouldPass.length).toEqual(0);

    expect(errShouldFail).toBeTruthy();
    expect(errShouldFail.length).toEqual(1);

    const modelNames: string[] = validator.modelNames;
    expect(modelNames.length).toEqual(2);
    expect(modelNames.includes('SimpleItem')).toBeTruthy();
    expect(modelNames.includes('ApiErrorResponse')).toBeTruthy();
    expect(modelNames.includes('XYZ')).toBeFalsy();
  });
});
