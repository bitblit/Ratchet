import path from 'path';
import { FilesToStaticClass } from './files-to-static-class.js';
import { fileURLToPath, URL } from 'url';

const testDirname: string = fileURLToPath(new URL('.', import.meta.url));

describe('#filesToStaticClass', function () {
  it('should convert files to a static class', async () => {
    const out: string = await FilesToStaticClass.process(
      [path.join(testDirname, 'files-to-static-class.ts'), path.join(testDirname, 'cli-ratchet.ts')],
      'Test'
    );
    expect(out).not.toBeNull();
    expect(out.length).toBeGreaterThan(0);
  });
});
