'use strict';

const { graphqlKoa, graphiqlKoa } = require('apollo-server-koa');
const { koa: voyagerMiddleware } = require('graphql-voyager/middleware');

module.exports = (_, app) => {
  const options = app.config.graphql;
  const graphQLRouter = options.router;
  options.graphiqlRouter = options.graphiqlRouter ? options.graphiqlRouter : graphQLRouter;
  const voyagerRouter = options.voyagerRouter;
  let graphiql = true;

  if (options.graphiql === false) {
    graphiql = false;
  }

  let voyager = true;
  if (options.voyager === false) {
    voyager = false;
  }

  return async (ctx, next) => {
    /* istanbul ignore else */
    if (ctx.path === graphQLRouter) {
      if (ctx.request.accepts([ 'json', 'html' ]) === 'html' && graphiql) {
        if (options.onPreGraphiQL) {
          await options.onPreGraphiQL(ctx);
        }
        return graphiqlKoa({
          endpointURL: options.graphiqlRouter,
        })(ctx);
      }
      if (options.onPreGraphQL) {
        await options.onPreGraphQL(ctx);
      }
      return graphqlKoa({
        schema: app.schema,
        context: ctx,
        formatError: options.formatError,
      })(ctx);
    } else if (voyager && ctx.path === voyagerRouter) {
      return voyagerMiddleware({
        endpointURL: options.graphiqlRouter,
      })(ctx);
    }
    await next();
  };
};
