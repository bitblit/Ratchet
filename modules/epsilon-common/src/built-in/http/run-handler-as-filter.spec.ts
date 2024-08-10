import { Context, ProxyResult } from 'aws-lambda';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { EpsilonGlobalHandler } from '../../epsilon-global-handler.js';
import { SampleServerComponents } from '../../sample/sample-server-components.js';
import { RunHandlerAsFilter } from './run-handler-as-filter.js';
import { ExtendedAPIGatewayEvent } from '../../config/http/extended-api-gateway-event.js';
import { RouteAndParse } from '../../http/web-handler.js';
import { RouterUtil } from '../../http/route/router-util.js';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';

describe('#routerUtilApplyOpenApiDoc', function () {
  test('should find the most specific route and the least specific', async () => {
    const inst: EpsilonGlobalHandler = await SampleServerComponents.createSampleEpsilonGlobalHandler('jest-most specific route');

    expect(inst.epsilon.modelValidator).toBeTruthy();

    // TODO: move this to its own test
    const evtFixed: ExtendedAPIGatewayEvent = {
      httpMethod: 'get',
      path: '/v0/multi/fixed',
      requestContext: {
        stage: 'v0',
      },
      queryStringParameters: {},
    } as ExtendedAPIGatewayEvent;

    const evtVar: ExtendedAPIGatewayEvent = {
      httpMethod: 'get',
      path: '/v0/multi/xyz',
      requestContext: {
        stage: 'v0',
      },
      queryStringParameters: {},
    } as ExtendedAPIGatewayEvent;

    const findFixedRP: RouteAndParse = await inst.epsilon.webHandler.findBestMatchingRoute(evtFixed);
    const findVariableRP: RouteAndParse = await inst.epsilon.webHandler.findBestMatchingRoute(evtVar);
    const findFixed: ProxyResult = await RunHandlerAsFilter.findHandler(findFixedRP, evtFixed, {} as Context, false);
    const findVariable: ProxyResult = await RunHandlerAsFilter.findHandler(findVariableRP, evtVar, {} as Context, false);
    expect(findFixed).toBeTruthy();
    expect(findFixed['flag']).toEqual('fixed');
    expect(findVariable).toBeTruthy();
    expect(findVariable['flag']).toEqual('variable');
    Logger.info('done');
  });

  test('should reformat a path to match the other library', function () {
    const inString: string = '/meta/item/{itemId}';
    const outString: string = RouterUtil.openApiPathToRouteParserPath(inString);
    expect(outString).toEqual('/meta/item/:itemId');
  });

  test('should redact authorization values from events for logging', function () {
    const inputEvent: any = {
      authorization: {
        raw: 'secret-access-token-here',
      },
      headers: {
        authorization: 'Bearer secret-access-token-here',
      },
    };
    // @ts-expect-error private method
    const logEventObj: any = JSON.parse(RunHandlerAsFilter.eventToStringForLog(inputEvent));
    expect(logEventObj.authorization.raw).toEqual(RunHandlerAsFilter.redact(inputEvent.authorization.raw));
    expect(logEventObj.headers.authorization).toEqual(RunHandlerAsFilter.redact(logEventObj.headers.authorization));
  });
});
