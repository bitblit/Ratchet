import { mapSchema, MapperKind, getDirective } from "@graphql-tools/utils";
import { GraphQLSchema } from "graphql";
import { UnauthorizedError } from "../../../http/error/unauthorized-error.ts";

type ResolverFn = (parent: any, args: any, ctx: any, info: any) => any;

export class EpsilonAutoDirectives {
  // Prevent instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static DIRECTIVE_GQL = 'directive @ep_authenticated on FIELD_DEFINITION\n' +
    'directive @ep_timed(name: String) on FIELD_DEFINITION\n'

  private static wrapWithAuthenticated(resolve: ResolverFn): ResolverFn {
    return async (parent, args, ctx, info) => {
      if (!ctx.user) throw new UnauthorizedError('No token provided');
      return resolve(parent, args, ctx, info);
    };
  }

  private static wrapWithTimed(resolve: ResolverFn, name?: string): ResolverFn {
    return async (parent, args, ctx, info) => {
      const label = name ?? `${info.parentType.name}.${info.fieldName}`;
      const start = performance.now();
      try {
        return await resolve(parent, args, ctx, info);
      } finally {
        const ms = performance.now() - start;
        ctx.metrics?.timings?.push({ label, ms });
      }
    };
  }

  public static applyDirectiveDecorators(schema: GraphQLSchema): GraphQLSchema {
    return mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig, fieldName) => {
        //const nm = fieldConfig['name'];
        const originalResolve: ResolverFn =
          (fieldConfig.resolve as any) ?? ((src: any) => src[fieldName]);

        // Read directives off the schema AST node
        const auth = getDirective(schema, fieldConfig, "ep_authenticated")?.[0] as
          | { role?: string }
          | undefined;
        const timed = getDirective(schema, fieldConfig, "ep_timed")?.[0] as
          | { name?: string }
          | undefined;

        let resolve = originalResolve;

        if (auth) resolve = EpsilonAutoDirectives.wrapWithAuthenticated(resolve);
        if (timed) resolve = EpsilonAutoDirectives.wrapWithTimed(resolve, timed.name);

        return { ...fieldConfig, resolve };
      },
    });
  }


}