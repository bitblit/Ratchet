/**
 * This is an example of how to setup a local server for testing.  Replace the createRouterConfig function
 * with your own.
 */

import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { ErrorRatchet } from '@bitblit/ratchet-common/lang/error-ratchet';
import { PromiseRatchet } from '@bitblit/ratchet-common/lang/promise-ratchet';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import { LoggerLevelName } from '@bitblit/ratchet-common/logger/logger-level-name';
import { NumberRatchet } from '@bitblit/ratchet-common/lang/number-ratchet';
import { JwtTokenBase } from '@bitblit/ratchet-common/jwt/jwt-token-base';
import { BooleanRatchet } from '@bitblit/ratchet-common/lang/boolean-ratchet';
import { ApolloServer } from '@apollo/server';
import { gql } from 'graphql-tag';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { EpsilonGlobalHandler } from '../epsilon-global-handler.js';
import { AuthorizerFunction } from '../config/http/authorizer-function.js';
import { HandlerFunction } from '../config/http/handler-function.js';
import { BuiltInHandlers } from '../built-in/http/built-in-handlers.js';
import { HttpConfig } from '../config/http/http-config.js';
import { LocalWebTokenManipulator } from '../http/auth/local-web-token-manipulator.js';
import { BackgroundConfig } from '../config/background/background-config.js';
import { EchoProcessor } from '../built-in/background/echo-processor.js';
import { NoOpProcessor } from '../built-in/background/no-op-processor.js';
import { SampleDelayProcessor } from '../built-in/background/sample-delay-processor.js';
import { LogAndEnqueueEchoProcessor } from '../built-in/background/log-and-enqueue-echo-processor.js';
import { EpsilonConfig } from '../config/epsilon-config.js';
import { EpsilonInstance } from '../epsilon-instance.js';
import { EpsilonConfigParser } from '../util/epsilon-config-parser.js';
import { RouterUtil } from '../http/route/router-util.js';
import { SampleInputValidatedProcessor } from '../built-in/background/sample-input-validated-processor.js';
import { HttpProcessingConfig } from '../config/http/http-processing-config.js';
import { BuiltInAuthorizers } from '../built-in/http/built-in-authorizers.js';
import { ApolloFilter } from '../built-in/http/apollo-filter.js';
import { SampleInputValidatedProcessorData } from '../built-in/background/sample-input-validated-processor-data.js';
import { BuiltInFilters } from '../built-in/http/built-in-filters.js';
import { LogMessageBackgroundErrorProcessor } from '../built-in/background/log-message-background-error-processor.js';
import { SingleThreadLocalBackgroundManager } from '../background/manager/single-thread-local-background-manager.js';
import { BackgroundManagerLike } from '../background/manager/background-manager-like.js';
import { SampleServerStaticFiles } from './sample-server-static-files.js';
import { ApolloUtil } from '../built-in/http/apollo/apollo-util.js';
import { EpsilonApolloCorsMethod } from '../built-in/http/apollo/epsilon-apollo-cors-method.js';

export class SampleServerComponents {
  // Prevent instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static async createSampleApollo(): Promise<ApolloServer> {
    const gqlString: string = SampleServerStaticFiles.SAMPLE_SERVER_GRAPHQL;
    Logger.silly('Creating apollo from : %s', gqlString);
    const typeDefs = gql(gqlString);

    // Provide resolver functions for your schema fields
    const resolvers = {
      RootQueryType: {
        serverMeta: async (_root) => {
          return { version: 'A1', serverTime: new Date().toISOString() };
        },
        forceTimeout: async (_root) => {
          // This will be longer than the max timeout
          await PromiseRatchet.wait(1000 * 60 * 30);
          return { placeholder: 'A1' };
        },
      },
    };

    const server: ApolloServer = new ApolloServer({
      introspection: true,
      typeDefs,
      resolvers,
      plugins: [
        /*
        // Install a landing page plugin based on NODE_ENV
        process.env.NODE_ENV === 'production'
          ? ApolloServerPluginLandingPageProductionDefault({
              graphRef: 'my-graph-id@my-graph-variant',
              footer: false,
            })
          : ApolloServerPluginLandingPageLocalDefault({ footer: false }),

           */
        ApolloServerPluginLandingPageLocalDefault({ footer: false }),
      ],
    });
    // Need the server started before we start processing...
    await server.start();

    return server;
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
    // GraphQL endpoints are handled by filter and aren't in the OpenAPI spec so no need to wire them here

    const tokenManipulator: LocalWebTokenManipulator<JwtTokenBase> = new LocalWebTokenManipulator(['abcd1234'], 'sample.erigir.com')
      .withParseFailureLogLevel(LoggerLevelName.debug)
      .withExtraDecryptionKeys(['abcdefabcdef'])
      .withOldKeyUseLogLevel(LoggerLevelName.info);

    const meta: HttpProcessingConfig = RouterUtil.defaultHttpMetaProcessingConfigWithAuthenticationHeaderParsing(tokenManipulator);
    meta.timeoutMS = 10_000;

    ApolloFilter.addApolloFilterToList(meta.preFilters, new RegExp('.*graphql.*'), await SampleServerComponents.createSampleApollo(), {
      context: (arg) => ApolloUtil.defaultEpsilonApolloContext(arg, {jwtRatchet:tokenManipulator.jwtRatchet}),
      timeoutMS: 5_000,
      corsMethod: EpsilonApolloCorsMethod.All,
    });

    /*


        {
      cors: {
        origin: '*',
        credentials: true,
      },
    } as CreateHandlerOptions);
    
     */
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
