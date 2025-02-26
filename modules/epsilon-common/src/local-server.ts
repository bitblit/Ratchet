import { APIGatewayEvent, Context, ProxyResult, SNSEvent } from 'aws-lambda';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import { LoggerLevelName } from '@bitblit/ratchet-common/logger/logger-level-name';
import { Base64Ratchet } from '@bitblit/ratchet-common/lang/base64-ratchet';
import { JwtTokenBase } from '@bitblit/ratchet-common/jwt/jwt-token-base';
import http, { IncomingMessage, Server, ServerResponse } from 'http';
import https from 'https';
import { DateTime } from 'luxon';
import { EventUtil } from './http/event-util.js';
import { EpsilonGlobalHandler } from './epsilon-global-handler.js';
import { SampleServerComponents } from './sample/sample-server-components.js';
import { LocalWebTokenManipulator } from './http/auth/local-web-token-manipulator.js';
import { LocalServerOptions } from './config/local-server/local-server-options.js';
import { LocalServerHttpMethodHandling } from './config/local-server/local-server-http-method-handling.js';
import { LocalServerCert } from '@bitblit/ratchet-node-only/http/local-server-cert';
import { EpsilonConstants } from './epsilon-constants.js';
import { InternalBackgroundEntry } from './background/internal-background-entry.js';
import { AbstractBackgroundManager } from './background/manager/abstract-background-manager.js';
import { BackgroundEntry } from './background/background-entry.js';
import { ErrorRatchet } from '@bitblit/ratchet-common/lang/error-ratchet';
import { ResponseUtil } from "./http/response-util.js";
import { NumberRatchet } from "@bitblit/ratchet-common/lang/number-ratchet";

/**
 * A simplistic server for testing your lambdas locally
 */
export class LocalServer {
  private server: Server;
  private options: LocalServerOptions;

  constructor(
    private globalHandler: EpsilonGlobalHandler,
    private port: number = 8888,
    private https: boolean = false,
  ) {
    this.options = {
      methodHandling: LocalServerHttpMethodHandling.Lowercase,
    };
  }

  async runServer(): Promise<boolean> {
    return new Promise<boolean>((res, rej) => {
      try {
        Logger.info('Starting Epsilon server on port %d', this.port);

        if (this.https) {
          const options = {
            key: LocalServerCert.CLIENT_KEY_PEM,
            cert: LocalServerCert.CLIENT_CERT_PEM,
          };
          Logger.info(
            'Starting https server - THIS SERVER IS NOT SECURE!  The KEYS are in the code!  Testing Server Only - Use at your own risk!',
          );
          this.server = https.createServer(options, this.requestHandler.bind(this)).listen(this.port);
        } else {
          this.server = http.createServer(this.requestHandler.bind(this)).listen(this.port);
        }
        Logger.info('Epsilon server is listening');

        // Also listen for SIGINT
        process.on('SIGINT', () => {
          Logger.info('Caught SIGINT - shutting down test server...');
          this.server.close();
          res(true);
        });
      } catch (err) {
        Logger.error('Local server failed : %s', err, err);
        rej(err);
      }
    });
  }

  async requestHandler(request: IncomingMessage, response: ServerResponse): Promise<any> {
    const context: Context = {
      awsRequestId: 'LOCAL-' + StringRatchet.createType4Guid(),
      getRemainingTimeInMillis(): number {
        return 300000;
      },
    } as Context; //TBD
    const evt: APIGatewayEvent = await LocalServer.messageToApiGatewayEvent(request, context, this.options);
    const logEventLevel: LoggerLevelName = EventUtil.eventIsAGraphQLIntrospection(evt) ? LoggerLevelName.silly : LoggerLevelName.info;

    if (evt.path.startsWith('/epsilon-poison-pill')) {
      this.server.close(() => {
        Logger.info('Server closed');
      });
      return true;
    } else if (evt.path.startsWith('/epsilon-background-launcher')) {
      // Shows a simple page for launching background tasks
      Logger.info('Showing background launcher page');
      const names: string[] = this.globalHandler.epsilon.backgroundHandler.validProcessorNames;
      response.end(LocalServer.buildBackgroundTriggerFormHtml(names));
      return true;
    } else if (evt.path.startsWith('/epsilon-background-trigger')) {
      Logger.info('Running background trigger');
      try {
        const entry: BackgroundEntry<any> = LocalServer.parseEpsilonBackgroundTriggerAsTask(evt);
        const processed: boolean = await this.globalHandler.processSingleBackgroundEntry(entry);
        response.end(`<html><body>BG TRIGGER VALID, returned ${processed} : task : ${entry.type} : data: ${entry.data}</body></html>`);
      } catch (err) {
        response.end(`<html><body>BG TRIGGER FAILED : Error : ${err}</body></html>`);
      }
      return true;
    } else {
      const result: ProxyResult = await this.globalHandler.lambdaHandler(evt, context);
      const written: boolean = await LocalServer.writeProxyResultToServerResponse(result, response, logEventLevel);
      return written;
    }
  }

  public static parseEpsilonBackgroundTriggerAsTask(evt: APIGatewayEvent): BackgroundEntry<any> {
    Logger.info('Running background trigger');
    // Fires off the event as a SNS event instead of a HTTP event
    const taskName: string = StringRatchet.trimToNull(evt.queryStringParameters['task']);
    let dataJson: string = StringRatchet.trimToNull(evt.queryStringParameters['dataJson']);
    let metaJson: string = StringRatchet.trimToNull(evt.queryStringParameters['metaJson']);
    // Use this to match what AWS gateways do
    dataJson = dataJson ? ResponseUtil.decodeUriComponentAndReplacePlus(dataJson) : dataJson;
    metaJson = metaJson ? ResponseUtil.decodeUriComponentAndReplacePlus(metaJson) : metaJson;
    let error: string = '';

    error += taskName ? '' : 'No task provided';
    let data: any = null;
    let _meta: any = null;
    try {
      if (dataJson) {
        data = JSON.parse(dataJson);
      }
    } catch (err) {
      error += 'Data is not valid JSON : ' + err+ ' WAS: '+dataJson;
    }
    try {
      if (metaJson) {
        _meta = JSON.parse(metaJson);
      }
    } catch (err) {
      error += 'Meta is not valid JSON : ' + err + ' WAS: '+metaJson;
    }

    if (error.length > 0) {
      throw ErrorRatchet.throwFormattedErr('Errors %j', error);
    }
    const rval: BackgroundEntry<any> = {
      type: taskName,
      data: data,
      //meta: meta
    };
    return rval;
  }

  public static async bodyAsBase64String(request: IncomingMessage): Promise<string> {
    return new Promise<string>((res, _rej) => {
      const body = [];
      request.on('data', (chunk) => {
        body.push(chunk);
      });
      request.on('end', () => {
        const rval: string = Buffer.concat(body).toString('base64');
        res(rval);
      });
    });
  }

  public static async messageToApiGatewayEvent(
    request: IncomingMessage,
    context: Context,
    options: LocalServerOptions,
  ): Promise<APIGatewayEvent> {
    const bodyString: string = await LocalServer.bodyAsBase64String(request);
    const stageIdx: number = request.url.indexOf('/', 1);
    const stage: string = request.url.substring(1, stageIdx);
    const path: string = request.url.substring(stageIdx + 1);

    const reqTime: number = new Date().getTime();
    const formattedTime: string = DateTime.utc().toFormat('dd/MMM/yyyy:hh:mm:ss ZZ');
    const queryStringParams: Record<string, string> = LocalServer.parseQueryParamsFromUrlString(path);
    const headers: any = Object.assign({}, request.headers);
    headers['X-Forwarded-Proto'] = 'http'; // This server is always unencrypted

    // Some want one way, some want the other!
    let targetMethod: string = StringRatchet.trimToEmpty(request.method);
    targetMethod = options?.methodHandling === LocalServerHttpMethodHandling.Lowercase ? targetMethod.toLowerCase() : targetMethod;
    targetMethod = options?.methodHandling === LocalServerHttpMethodHandling.Uppercase ? targetMethod.toUpperCase() : targetMethod;

    const rval: APIGatewayEvent = {
      body: bodyString,
      multiValueHeaders: {},
      multiValueQueryStringParameters: {},
      resource: '/{proxy+}',
      path: request.url,
      httpMethod: targetMethod,
      isBase64Encoded: true,
      queryStringParameters: queryStringParams,
      pathParameters: {
        proxy: path,
      },
      stageVariables: {
        baz: 'qux',
      },
      headers: headers,
      requestContext: {
        accountId: '123456789012',
        resourceId: '123456',
        stage: stage,
        requestId: context.awsRequestId,
        requestTime: formattedTime, // '09/Apr/2015:12:34:56 +0000',
        requestTimeEpoch: reqTime, //1428582896000,
        identity: {
          apiKeyId: null,
          clientCert: null,
          principalOrgId: null,
          apiKey: null,
          cognitoIdentityPoolId: null,
          accountId: null,
          cognitoIdentityId: null,
          caller: null,
          accessKey: null,
          sourceIp: '127.0.0.1',
          cognitoAuthenticationType: null,
          cognitoAuthenticationProvider: null,
          userArn: null,
          userAgent: 'Custom User Agent String',
          user: null,
        },
        path: request.url, // /prod/path/to/resource
        domainName: request.headers['host'],
        resourcePath: '/{proxy+}',
        httpMethod: request.method.toLowerCase(),
        apiId: '1234567890',
        protocol: 'HTTP/1.1',
        authorizer: null,
      },
    };

    return rval;
  }

  public static createBackgroundSNSEvent(entry: BackgroundEntry<any>): SNSEvent {
    const internal: InternalBackgroundEntry<any> = Object.assign({}, entry, {
      createdEpochMS: new Date().getTime(),
      guid: AbstractBackgroundManager.generateBackgroundGuid(),
      traceId: 'FAKE-TRACE-' + StringRatchet.createType4Guid(),
      traceDepth: 1,
    });
    const toWrite: any = {
      type: EpsilonConstants.BACKGROUND_SNS_IMMEDIATE_RUN_FLAG,
      backgroundEntry: internal,
    };

    const rval: SNSEvent = {
      Records: [
        {
          EventVersion: '1.0',
          EventSubscriptionArn: 'arn:aws:sns:us-east-1:123456789012:sns-lambda:21be56ed-a058-49f5-8c98-aedd2564c486',
          EventSource: 'aws:sns',
          Sns: {
            SignatureVersion: '1',
            Timestamp: '2019-01-02T12:45:07.000Z',
            Signature: 'tcc6faL2yUC6dgZdmrwh1Y4cGa/ebXEkAi6RibDsvpi+tE/1+82j...65r==',
            SigningCertUrl: 'https://sns.us-east-1.amazonaws.com/SimpleNotificationService-ac565b8b1a6c5d002d285f9598aa1d9b.pem',
            MessageId: '95df01b4-ee98-5cb9-9903-4c221d41eb5e',
            Message: JSON.stringify(toWrite),
            MessageAttributes: {},
            Type: 'Notification',
            UnsubscribeUrl:
              'https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&amp;SubscriptionArn=arn:aws:sns:us-east-1:123456789012:test-lambda:21be56ed-a058-49f5-8c98-aedd2564c486',
            TopicArn: 'arn:aws:sns:us-east-1:123456789012:sns-lambda',
            Subject: 'EpsilonBackgroundInvoke',
          },
        },
      ],
    };
    return rval;
  }

  public static isProxyResult(val: any): boolean {
    // Other items are optional, but it must have a statusCode and a body
    // Other are headers, isBase64Encoded, cookies
    return val && NumberRatchet.safeNumber(val.statusCode)!==null && StringRatchet.trimToNull(val.body)!==null;
  }

  public static async writeProxyResultToServerResponse(
    proxyResult: ProxyResult,
    response: ServerResponse,
    logLevel: LoggerLevelName,
  ): Promise<boolean> {
    if (Logger.levelIsEnabled(logLevel)) {
      if (proxyResult.isBase64Encoded) {
        const dup: ProxyResult = structuredClone(proxyResult);
        dup.body = Base64Ratchet.base64StringToString(dup.body);
        dup.isBase64Encoded = false;
        Logger.logByLevel(logLevel, 'Result (UB64): %j', dup);
      } else {
        Logger.logByLevel(logLevel, 'Result: %j', proxyResult);
      }
    }

    response.statusCode = proxyResult.statusCode ?? 500
    if (proxyResult.headers) {
      Object.keys(proxyResult.headers).forEach((hk) => {
        response.setHeader(hk, String(proxyResult.headers[hk]));
      });
    }
    if (proxyResult.multiValueHeaders) {
      Object.keys(proxyResult.multiValueHeaders).forEach((hk) => {
        response.setHeader(hk, proxyResult.multiValueHeaders[hk].join(','));
      });
    }
    const toWrite: Buffer = proxyResult.isBase64Encoded ? Buffer.from(proxyResult.body, 'base64') : Buffer.from(proxyResult.body);

    response.end(toWrite);
    return !!proxyResult.body;
  }

  /**
   * Takes in a URL string and returns the parsed URL query params in the way the ALB / Lambda
   * integration does.
   * Note that it does not URL decode the values.
   */
  public static parseQueryParamsFromUrlString(urlString: string): Record<string, string> {
    const rval: Record<string, string> = {};

    const searchStringParts: string[] = urlString.split('?');
    if (searchStringParts.length < 2) {
      // No query string.
      return rval;
    }

    const searchString: string = searchStringParts.slice(1).join('?');

    const searchParts: string[] = searchString.split('&');
    for (const eachKeyValueString of searchParts) {
      const eachKeyValueStringParts: string[] = eachKeyValueString.split('=');
      const eachKey: string = eachKeyValueStringParts[0];
      const eachValue: string = eachKeyValueStringParts.slice(1).join('=');
      rval[eachKey] = eachValue;
    }

    return rval;
  }

  public static async runSampleBatchOnlyServerFromCliArgs(_args: string[]): Promise<void> {
    Logger.setLevel(LoggerLevelName.debug);
    const handler: EpsilonGlobalHandler = await SampleServerComponents.createSampleBatchOnlyEpsilonGlobalHandler(
      'SampleBatchOnlyLocalServer-' + Date.now(),
    );
    const testServer: LocalServer = new LocalServer(handler);
    const res: boolean = await testServer.runServer();
    Logger.info('Res was : %s', res);
  }

  public static async runSampleLocalServerFromCliArgs(_args: string[]): Promise<void> {
    Logger.setLevel(LoggerLevelName.debug);
    const localTokenHandler: LocalWebTokenManipulator<JwtTokenBase> = new LocalWebTokenManipulator<JwtTokenBase>(
      ['abcd1234'],
      'sample-server',
    );
    const token: string = await localTokenHandler.createJWTStringAsync('asdf', {}, ['USER'], 3600);

    Logger.info('Use token: %s', token);
    const handler: EpsilonGlobalHandler = await SampleServerComponents.createSampleEpsilonGlobalHandler('SampleLocalServer-' + Date.now());
    const testServer: LocalServer = new LocalServer(handler, 8888, true);
    const res: boolean = await testServer.runServer();
    Logger.info('Res was : %s', res);
  }

  public static buildBackgroundTriggerFormHtml(names?: string[]): string {
    let html: string = '<html><head><title>Epsilon BG Launcher</title></head><body><div>';
    html += '<h1>Epsilon Background Launcher</h1><form method="GET" action="/epsilon-background-trigger">';
    html += '<div style="display: flex; flex-direction: column">';
    if (names) {
      html += '<label for="task">Task Name</label><select id="task" name="task">';
      names.forEach((n) => {
        html += `<option value="${n}">${n}</option>`;
      });
      html += '</select>';
    } else {
      html += '<label for="task">Task Name</label><input type="text" id="task" name="task"></input>';
    }
    html += '<label for="dataJson">Data JSON</label><textarea id="dataJson" name="dataJson">{}</textarea>';
    html += '<label for="metaJson">Meta JSON</label><textarea id="metaJson" name="metaJson">{}</textarea>';
    html += '<input type="submit" value="Submit">';
    html += '</div></form></div></body></html>';

    return html;
  }
}
