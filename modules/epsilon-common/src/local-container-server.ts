import { APIGatewayEvent, Context, ProxyResult, SNSEvent } from 'aws-lambda';
import http, { IncomingMessage, Server, ServerResponse } from 'http';
import { EventUtil } from './http/event-util.js';
import fetch from 'cross-fetch';
import { LocalServer } from './local-server.js';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import { LoggerLevelName } from '@bitblit/ratchet-common/logger/logger-level-name';
import { CliRatchet } from '@bitblit/ratchet-node-only/cli/cli-ratchet';
import { LocalServerOptions } from './config/local-server/local-server-options.js';
import { LocalServerHttpMethodHandling } from './config/local-server/local-server-http-method-handling.js';
import { BackgroundEntry } from './background/background-entry.js';

/**
 * A simplistic server for testing your lambdas-in-container locally
 */
export class LocalContainerServer {
  private server: Server;
  private aborted: boolean = false;
  private options: LocalServerOptions;

  constructor(
    private port: number = 8889,
    private containerUrl: string = 'http://localhost:9000/2015-03-31/functions/function/invocations',
  ) {
    this.options = {
      methodHandling: LocalServerHttpMethodHandling.Uppercase,
    };
  }

  public async runServer(): Promise<boolean> {
    return new Promise<boolean>((res, rej) => {
      try {
        Logger.info('Starting Epsilon container-wrapper server on port %d calling to %s', this.port, this.containerUrl);
        this.server = http.createServer(this.requestHandler.bind(this)).listen(this.port);
        Logger.info('Epsilon server is listening');

        // Also listen for SIGINT
        process.on('SIGINT', () => {
          Logger.info('Caught SIGINT - shutting down test server...');
          this.aborted = true;
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

    Logger.logByLevel(logEventLevel, 'Processing event: %j', evt);

    const respBodyText: string = null;
    let result: ProxyResult;
    if (evt.path == '/epsilon-poison-pill') {
      this.aborted = true;
      return true;
    } else if (evt.path.startsWith('/epsilon-background-launcher')) {
      // Shows a simple page for launching background tasks
      Logger.info('Showing background launcher page');
      response.end(LocalServer.buildBackgroundTriggerFormHtml());
      return true;
    } else if (evt.path.startsWith('/epsilon-background-trigger')) {
      Logger.info('Running background trigger');
      try {
        const bgEntry: BackgroundEntry<any> = LocalServer.parseEpsilonBackgroundTriggerAsTask(evt);
        const snsEvent: SNSEvent = LocalServer.createBackgroundSNSEvent(bgEntry);
        const postResp: Response = await fetch(this.containerUrl, { method: 'POST', body: JSON.stringify(snsEvent) });
        const postProxy: ProxyResult = await postResp.json();
        const written: boolean = await LocalServer.writeProxyResultToServerResponse(postProxy, response, logEventLevel);
        return written;
      } catch (err) {
        response.end(`<html><body>BG TRIGGER FAILED : Error : ${err}</body></html>`);
        return true;
      }
    } else {
      try {
        const postResp: Response = await fetch(this.containerUrl, { method: 'POST', body: JSON.stringify(evt) });
        const postProxy: ProxyResult = await postResp.json();
        const written: boolean = await LocalServer.writeProxyResultToServerResponse(postProxy, response, logEventLevel);
        return written;
      } catch (err) {
        Logger.error('Failed: %s : Body was %s Response was : %j', err, respBodyText, result, err);
        return '{"bad":true}';
      }
    }
  }

  public static async runFromCliArgs(_args: string[]): Promise<void> {
    try {
      Logger.setLevel(LoggerLevelName.debug);
      Logger.debug('Running local container server : %j', process?.argv);
      const _postArgs: string[] = CliRatchet.argsAfterCommand(['run-local-container-server']);
      const testServer: LocalContainerServer = new LocalContainerServer();
      await testServer.runServer();
      Logger.info('Got res server');
      process.exit(0);
    } catch (err) {
      Logger.error('Error : %s', err);
      process.exit(1);
    }
  }
}
