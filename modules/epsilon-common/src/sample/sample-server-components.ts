/**
 * This is an example of how to setup a local server for testing.  Replace the createRouterConfig function
 * with your own.
 */

import { ErrorRatchet } from "@bitblit/ratchet-common/lang/error-ratchet";
import { StringRatchet } from "@bitblit/ratchet-common/lang/string-ratchet";
import { LoggerLevelName } from "@bitblit/ratchet-common/logger/logger-level-name";
import { NumberRatchet } from "@bitblit/ratchet-common/lang/number-ratchet";
import { JwtTokenBase } from "@bitblit/ratchet-common/jwt/jwt-token-base";
import { BooleanRatchet } from "@bitblit/ratchet-common/lang/boolean-ratchet";
import { EpsilonGlobalHandler } from "../epsilon-global-handler.js";
import { AuthorizerFunction } from "../config/http/authorizer-function.js";
import { HandlerFunction } from "../config/http/handler-function.js";
import { BuiltInHandlers } from "../built-in/http/built-in-handlers.js";
import { HttpConfig } from "../config/http/http-config.js";
import { LocalWebTokenManipulator } from "../http/auth/local-web-token-manipulator.js";
import { BackgroundConfig } from "../config/background/background-config.js";
import { EchoProcessor } from "../built-in/background/echo-processor.js";
import { NoOpProcessor } from "../built-in/background/no-op-processor.js";
import { SampleDelayProcessor } from "../built-in/background/sample-delay-processor.js";
import { LogAndEnqueueEchoProcessor } from "../built-in/background/log-and-enqueue-echo-processor.js";
import { EpsilonConfig } from "../config/epsilon-config.js";
import { EpsilonInstance } from "../epsilon-instance.js";
import { EpsilonConfigParser } from "../util/epsilon-config-parser.js";
import { RouterUtil } from "../http/route/router-util.js";
import { SampleInputValidatedProcessor } from "../built-in/background/sample-input-validated-processor.js";
import { HttpProcessingConfig } from "../config/http/http-processing-config.js";
import { BuiltInAuthorizers } from "../built-in/http/built-in-authorizers.js";
import { SampleInputValidatedProcessorData } from "../built-in/background/sample-input-validated-processor-data.js";
import { BuiltInFilters } from "../built-in/http/built-in-filters.js";
import { LogMessageBackgroundErrorProcessor } from "../built-in/background/log-message-background-error-processor.js";
import { SingleThreadLocalBackgroundManager } from "../background/manager/single-thread-local-background-manager.js";
import { BackgroundManagerLike } from "../background/manager/background-manager-like.js";
import { SampleServerStaticFiles } from "./sample-server-static-files.js";

export class SampleServerComponents {
  // Prevent instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static createSampleTokenManipulator(): LocalWebTokenManipulator<JwtTokenBase> {
    const tokenManipulator: LocalWebTokenManipulator<JwtTokenBase> = new LocalWebTokenManipulator(['abcd1234'], 'sample.erigir.com')
      .withParseFailureLogLevel(LoggerLevelName.debug)
      .withExtraDecryptionKeys(['abcdefabcdef'])
      .withOldKeyUseLogLevel(LoggerLevelName.info);
    return tokenManipulator;
  }

  // Functions below here are for using as samples
  public static async createSampleEpsilonConfig(label: string): Promise<EpsilonConfig> {
    const yamlString: string = SampleServerStaticFiles.SAMPLE_OPEN_API_DOC;
    const authorizers: Map<string, AuthorizerFunction> = new Map<string, AuthorizerFunction>();
    authorizers.set('SampleAuthorizer', (token, evt) => BuiltInAuthorizers.simpleLoggedInAuth(token, evt));
    authorizers.set('LogAuthorizer', (token, evt) => BuiltInAuthorizers.simpleNoAuthenticationLogAccess(token, evt));

    const handlers: Map<string, HandlerFunction<any>> = new Map<string, HandlerFunction<any>>();
    handlers.set('get /', (event, context) => BuiltInHandlers.sample(event, null, context));
    handlers.set('get /meta/server', (event) => BuiltInHandlers.sample(event));
    handlers.set('get /meta/user', (event) => BuiltInHandlers.sample(event));
    handlers.set('get /meta/item/{itemId}', (event) => BuiltInHandlers.sample(event));
    handlers.set('post /secure/access-token', (event) => BuiltInHandlers.sample(event));
    handlers.set('get /multi/fixed', (event) => BuiltInHandlers.sample(event, 'fixed'));
    handlers.set('get /multi/{v}', (event) => BuiltInHandlers.sample(event, 'variable'));
    handlers.set('get /event', (event) => {
      return Promise.resolve({
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event, null, 2),
      });
    });
    handlers.set('get /err/{code}', (event) => {
      const err: Error = ErrorRatchet.fErr('Fake Err : %j', event);
      err['statusCode'] = NumberRatchet.safeNumber(event.pathParameters['code']);
      throw err;
    });
    handlers.set('get /meta/sample-item', async (event) => {
      const numberToUse: number = NumberRatchet.safeNumber(event.queryStringParameters['num']) || 5;
      const rval: SampleInputValidatedProcessorData = {
        numberParam: numberToUse,
        nameParam: 'Test-String',
      };
      return rval;
    });
    handlers.set('post /meta/sample-item', async (event) => {
      const parsed: SampleInputValidatedProcessorData = event.parsedBody;
      const forceFail: boolean = BooleanRatchet.parseBool(StringRatchet.trimToNull(event.queryStringParameters['forceFail'])) === true;
      if (forceFail) {
        parsed['numberParam'] = 'test' as unknown as number; // Should cause a failure outbound
      }

      return parsed;
    });

    const meta: HttpProcessingConfig = RouterUtil.defaultHttpMetaProcessingConfigWithAuthenticationHeaderParsing(SampleServerComponents.createSampleTokenManipulator());
    meta.timeoutMS = 10_000;
    meta.errorFilters.push((fCtx) => BuiltInFilters.secureOutboundServerErrorForProduction(fCtx, 'Clean Internal Server Error', 500));

    const preFiltersAllowingNull: HttpProcessingConfig = Object.assign({}, meta);
    // TODO: This approach is pretty fragile...
    preFiltersAllowingNull.preFilters = Object.assign([], preFiltersAllowingNull.preFilters);
    preFiltersAllowingNull.preFilters.splice(8, 1);

    const cfg: HttpConfig = {
      defaultMetaHandling: meta,
      handlers: handlers,
      authorizers: authorizers,
      overrideMetaHandling: [
        {
          pathRegex: '/background',
          methods: null,
          config: Object.assign({}, meta, { overrideAuthorizerName: 'LogAuthorizer' }),
        },
        {
          pathRegex: '/meta/server', // Allow null params ONLY on this route
          methods: ['GET'],
          config: preFiltersAllowingNull,
        },
      ],
      prefixesToStripBeforeRouteMatch: ['v0'],
      filterHandledRouteMatches: ['options .*'],
    };

    const background: BackgroundConfig = {
      //aws: {
      //  queueUrl: 'FAKE-LOCAL',
      //  notificationArn: 'FAKE-LOCAL',
      //},
      httpMetaEndpoint: '/background/meta',
      httpSubmissionPath: '/background',
      implyTypeFromPathSuffix: false,
      processors: [
        new EchoProcessor(),
        new NoOpProcessor(),
        new SampleDelayProcessor(),
        new SampleInputValidatedProcessor(),
        new LogAndEnqueueEchoProcessor(),
      ],
      errorProcessor: new LogMessageBackgroundErrorProcessor(),
    };

    const epsilonConfig: EpsilonConfig = {
      label: label,
      openApiYamlString: yamlString,
      httpConfig: cfg,
      backgroundConfig: background,
    };
    return epsilonConfig;
  }

  public static async createSampleEpsilonGlobalHandler(label: string): Promise<EpsilonGlobalHandler> {
    const epsilonConfig: EpsilonConfig = await SampleServerComponents.createSampleEpsilonConfig(label);
    const backgroundManager: SingleThreadLocalBackgroundManager = new SingleThreadLocalBackgroundManager();
    const epsilonInstance: EpsilonInstance = EpsilonConfigParser.epsilonConfigToEpsilonInstance(epsilonConfig, backgroundManager);
    const rval: EpsilonGlobalHandler = new EpsilonGlobalHandler(epsilonInstance);
    return rval;
  }

  public static async createSampleBatchOnlyEpsilonGlobalHandler(label: string): Promise<EpsilonGlobalHandler> {
    const epsilonConfig: EpsilonConfig = await SampleServerComponents.createSampleEpsilonConfig(label);
    epsilonConfig.httpConfig.handlers = new Map<string, HandlerFunction<any>>(); // Unused

    const byPassCfg: HttpProcessingConfig = Object.assign({}, epsilonConfig.httpConfig.defaultMetaHandling);
    byPassCfg.preFilters = byPassCfg.preFilters.concat([
      (fCtx) => BuiltInFilters.autoRespond(fCtx, { message: 'Background Processing Only' }),
    ]);
    epsilonConfig.httpConfig.overrideMetaHandling = [
      {
        pathRegex: '.*background.*',
        invertPathMatching: true,
        config: byPassCfg,
      },
    ];
    epsilonConfig.httpConfig.filterHandledRouteMatches = ['.*']; // Only want the batch handling

    const backgroundManager: BackgroundManagerLike = new SingleThreadLocalBackgroundManager();
    const epsilonInstance: EpsilonInstance = EpsilonConfigParser.epsilonConfigToEpsilonInstance(epsilonConfig, backgroundManager);
    const rval: EpsilonGlobalHandler = new EpsilonGlobalHandler(epsilonInstance);
    return rval;
  }
}
