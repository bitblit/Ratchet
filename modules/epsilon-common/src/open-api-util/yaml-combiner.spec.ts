import { Logger } from '@bitblit/ratchet-common';
import path from 'path';
import { YamlCombiner } from './yaml-combiner.js';
import { EsmRatchet } from '@bitblit/ratchet-common';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';

describe('#yamlCombiner', function () {
  test('should combine yamls', async () => {
    const files: string[] = [
      path.join(EsmRatchet.fetchDirName(import.meta.url), '../../../../test-data/epsilon/sample-yaml/test1.yaml'),
      path.join(EsmRatchet.fetchDirName(import.meta.url), '../../../../test-data/epsilon/sample-yaml/test2.yaml'),
    ];
    const root: string[] = ['components', 'schemas'];

    const result: string = YamlCombiner.combine(files, root);

    expect(result).toBeTruthy();
    expect(result.indexOf('Object1')).toBeGreaterThan(0);
    expect(result.indexOf('Object2')).toBeGreaterThan(0);
    expect(result.indexOf('Object3')).toBeGreaterThan(0);
    expect(result.indexOf('Object4')).toBeGreaterThan(0);
    expect(result.indexOf('components')).toEqual(0);
    expect(result.indexOf('schemas')).toBeGreaterThan(0);
    Logger.info('G: \n\n%s', result);
  }, 30000);
});
