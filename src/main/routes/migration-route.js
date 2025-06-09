import migrationRouterComposer from "../composer/migrations/migration-router-composer.js";

const migrationRoute = {
  get: async (httpRequest) => {
    const migrationRouter = migrationRouterComposer.execute();
    return await migrationRouter.route(httpRequest);
  },
  post: async (httpRequest) => {
    const migrationRouter = migrationRouterComposer.execute();
    return await migrationRouter.route(httpRequest);
  },
};

export default migrationRoute;
