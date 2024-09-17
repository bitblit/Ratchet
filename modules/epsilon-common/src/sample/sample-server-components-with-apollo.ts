/**
 * This is an example of how to setup a local server for testing.  Replace the createRouterConfig function
 * with your own.
 *
 * This is split from sample-server-components so that not everyone needs to include
 * apollo-server if they aren't gonna do graphql
 */

import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { PromiseRatchet } from "@bitblit/ratchet-common/lang/promise-ratchet";
import { ApolloServer } from "@apollo/server";
import { gql } from "graphql-tag";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { EpsilonConfig } from "../config/epsilon-config.js";
import { ApolloFilter } from "../built-in/http/apollo-filter.js";
import { SampleServerStaticFiles } from "./sample-server-static-files.js";
import { ApolloUtil } from "../built-in/http/apollo/apollo-util.js";
import { EpsilonApolloCorsMethod } from "../built-in/http/apollo/epsilon-apollo-cors-method.js";
import { SampleServerComponents } from "./sample-server-components";

export class SampleServerComponentsWithApollo{
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
    const cfg: EpsilonConfig = await SampleServerComponents.createSampleEpsilonConfig(label);

    ApolloFilter.addApolloFilterToList(cfg.httpConfig.defaultMetaHandling.preFilters, new RegExp('.*graphql.*'), await SampleServerComponentsWithApollo.createSampleApollo(), {
      context: (arg) => ApolloUtil.defaultEpsilonApolloContext(arg, {jwtRatchet:SampleServerComponents.createSampleTokenManipulator().jwtRatchet}),
      timeoutMS: 5_000,
      corsMethod: EpsilonApolloCorsMethod.All,
    });

    return cfg;
  }

}
