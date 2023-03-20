import fs from 'fs';
import path from 'path';
import { OpenApiDocModifications } from './open-api-doc-modifications';
import { OpenApiDocModifier } from './open-api-doc-modifier';
import { SampleServerStaticFiles } from '../sample/sample-server-static-files';

describe('#openApiDocModifier', function () {
  it('should exist', async () => {
    const data: string = SampleServerStaticFiles.SAMPLE_OPEN_API_DOC;
    expect(data).toBeTruthy();
    expect(data.length).toBeGreaterThan(0);

    const mods: OpenApiDocModifications = {
      newServerPath: 'https://api.sample.com/cw',
      removeTags: ['Neon', 'CORS'],
      removeEndpoints: [new RegExp('options .*')],
    } as OpenApiDocModifications;

    const result: string = new OpenApiDocModifier(mods).modifyOpenApiDoc(data);
    expect(result).toBeTruthy();
    // Logger.info('G: \n\n%s', result);
  }, 30000);
});
