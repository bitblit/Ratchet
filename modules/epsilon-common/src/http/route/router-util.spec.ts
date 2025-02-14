import { RouterUtil } from './router-util.js';
import { RouteAndParse } from '../web-handler.js';
import { APIGatewayEvent } from 'aws-lambda';
import { EpsilonGlobalHandler } from '../../epsilon-global-handler.js';
import { SampleServerComponents } from '../../sample/sample-server-components.js';
import { describe, expect, test } from 'vitest';

describe('#routerUtilApplyOpenApiDoc', function () {
  test('should create a router config from a yaml file', async () => {
    const inst: EpsilonGlobalHandler = await SampleServerComponents.createSampleEpsilonGlobalHandler('routerUtilApplyOpenApiDoc-jest');

    expect(inst.epsilon.modelValidator).toBeTruthy();
    expect(inst.epsilon.modelValidator.fetchModel('AccessTokenRequest')).toBeTruthy();

    // TODO: move this to its own test
    const evt: APIGatewayEvent = {
      httpMethod: 'get',
      path: '/v0/meta/server',
      requestContext: {
        stage: 'v0',
      },
    } as APIGatewayEvent;

    const find: RouteAndParse = await inst.epsilon.webHandler.findBestMatchingRoute(evt);
    expect(find).toBeTruthy();
  });

  test('should reformat a path to match the other library', function () {
    const inString: string = '/meta/item/{itemId}';
    const outString: string = RouterUtil.openApiPathToRouteParserPath(inString);
    expect(outString).toEqual('/meta/item/:itemId');
  });
});
