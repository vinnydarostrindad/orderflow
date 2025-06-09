import migrationRoute from "./migration-route.js";
import businessRoute from "./business-route.js";
import employeeRoute from "./employee-route.js";
import menuRoute from "./menu-routes.js";

const apiRoutes = {
  get: [
    {
      pattern: /^\/api\/v1\/migrations$/,
      handler: migrationRoute.get,
    },
    {
      pattern: /^\/api\/v1\/business\/([^/]+)$/,
      handler: businessRoute.getOne,
    },
    {
      pattern: /^\/api\/v1\/business\/([^/]+)\/employee$/,
      handler: employeeRoute.getAll,
    },
    {
      pattern: /^\/api\/v1\/business\/([^/]+)\/employee\/([^/]+)$/,
      handler: employeeRoute.getOne,
    },
  ],
  post: [
    {
      pattern: /^\/api\/v1\/migrations$/,
      handler: migrationRoute.post,
    },
    {
      pattern: /^\/api\/v1\/business$/,
      handler: businessRoute.post,
    },
    {
      pattern: /^\/api\/v1\/business\/([^/]+)\/employee$/,
      handler: employeeRoute.post,
    },
    {
      pattern: /^\/api\/v1\/business\/([^/]+)\/menu$/,
      handler: menuRoute.post,
    },
  ],
};

export default apiRoutes;
