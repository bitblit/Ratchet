import { describe, test, expect } from 'vitest';
import { GraphqlRatchet } from './graphql-ratchet';
import { StringRecordQueryProvider } from './provider/string-record-query-provider';
import { DefaultGraphqlRatchetEndpointProvider } from './provider/default-graphql-ratchet-endpoint-provider';

describe('#runTest', function () {
  test.skip('should pull defaults', async () => {
    const doc: string =
      '{\n' +
      '\n' +
      '   serverMeta {\n' +
      '    version\n' +
      '    launchTime\n' +
      '    serverTime\n' +
      '    status\n' +
      '    buildInfo {\n' +
      '      buildVersion\n' +
      '      buildHash\n' +
      '      buildBranch\n' +
      '      buildTag\n' +
      '    }\n' +
      '    specBuildInfo {\n' +
      '      buildVersion\n' +
      '      buildHash\n' +
      '      buildBranch\n' +
      '      buildTag\n' +
      '    }\n' +
      '  }\n' +
      '}';
    const url: string = 'https://localhost:8888/graphql';
    const gr: GraphqlRatchet = new GraphqlRatchet(
      new StringRecordQueryProvider({ q: doc }),
      new DefaultGraphqlRatchetEndpointProvider(url),
      null,
    );

    // Since this'll be self-signed
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    const out: any = await gr.executeQuery<any>('q', {}, true);
    expect(out).toBeTruthy();
  });
});
