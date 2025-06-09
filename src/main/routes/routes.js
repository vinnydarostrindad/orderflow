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
      pattern: /^\/api\/v1\/business\/(?<business_id>[^/]+)$/,
      handler: businessRoute.getOne,
    },
    {
      pattern: /^\/api\/v1\/business\/(?<business_id>[^/]+)\/employee$/,
      handler: employeeRoute.getAll,
    },
    {
      pattern:
        /^\/api\/v1\/business\/(?<business_id>[^/]+)\/employee\/(?<employee_id>[^/]+)$/,
      handler: employeeRoute.getOne,
    },
    {
      pattern: /^\/api\/v1\/business\/(?<business_id>[^/]+)\/menu$/,
      handler: menuRoute.getAll,
    },
    {
      pattern:
        /^\/api\/v1\/business\/(?<business_id>[^/]+)\/menu\/(?<menu_id>[^/]+)$/,
      handler: menuRoute.getOne,
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
      pattern: /^\/api\/v1\/business\/(?<business_id>[^/]+)\/employee$/,
      handler: employeeRoute.post,
    },
    {
      pattern: /^\/api\/v1\/business\/(?<business_id>[^/]+)\/menu$/,
      handler: menuRoute.post,
    },
  ],
};

export default apiRoutes;
