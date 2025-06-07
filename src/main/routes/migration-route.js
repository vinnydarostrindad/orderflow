import migrationRouterComposer from "../composer/migration-router-composer.js";

const migrationRoute = {
  get: async (req) => {
    const httpRequest = {
      method: req.method,
    };
    const migrationRouter = migrationRouterComposer.execute();
    return await migrationRouter.route(httpRequest);
  },
  post: async (req) => {
    const httpRequest = {
      method: req.method,
    };
    const migrationRouter = migrationRouterComposer.execute();
    return await migrationRouter.route(httpRequest);
  },
};

export default migrationRoute;
