import path from 'path';
import { FilesToStaticClass } from './files-to-static-class.js';
import { EsmRatchet } from '@bitblit/ratchet-common';
//import { fileURLToPath, URL } from 'url';
//import { Logger } from '../../common/logger';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';

const testDirname: string = EsmRatchet.fetchDirName(import.meta.url);

describe('#filesToStaticClass', function () {
  test('should convert files to a static class', async () => {
    const out: string = await FilesToStaticClass.process(
      [
        path.join(testDirname, 'files-to-static-class.ts'),
        path.join(testDirname, '../cli/cli-ratchet.ts'),
        path.join(testDirname, '../third-party/git'),
      ],
      'Test',
    );
    //Logger.info('xx: %s', out);

    expect(out).not.toBeNull();
    expect(out.length).toBeGreaterThan(0);
    console.info('\n\n' + out);
  });
});
