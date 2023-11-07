import path from 'path';
import { FilesToStaticClass } from './files-to-static-class';
//import { fileURLToPath, URL } from 'url';
//import { Logger } from '../../common/logger';

const testDirname: string = __dirname;

describe('#filesToStaticClass', function () {
  it('should convert files to a static class', async () => {
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
