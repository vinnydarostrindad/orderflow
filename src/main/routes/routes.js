import migrationRoute from "./migration-route.js";
import businessRoute from "./business-route.js";
import employeeRoute from "./employee-route.js";
import menuRoute from "./menu-route.js";
import menuItemRoute from "./menu-item-route.js";

const apiRoutes = {
  get: [
    {
      pattern: /^\/api\/v1\/migrations$/,
      handler: migrationRoute.get,
    },
    {
      pattern: /^\/api\/v1\/business\/(?<businessId>[^/]+)$/,
      handler: businessRoute.getOne,
    },
    {
      pattern: /^\/api\/v1\/business\/(?<businessId>[^/]+)\/employee$/,
      handler: employeeRoute.getAll,
    },
    {
      pattern:
        /^\/api\/v1\/business\/(?<businessId>[^/]+)\/employee\/(?<employeeId>[^/]+)$/,
      handler: employeeRoute.getOne,
    },
    {
      pattern: /^\/api\/v1\/business\/(?<businessId>[^/]+)\/menu$/,
      handler: menuRoute.getAll,
    },
    {
      pattern:
        /^\/api\/v1\/business\/(?<businessId>[^/]+)\/menu\/(?<menuId>[^/]+)$/,
      handler: menuRoute.getOne,
    },
    {
      pattern:
        /^\/api\/v1\/business\/(?<businessId>[^/]+)\/menu\/(?<menuId>[^/]+)\/item$/,
      handler: menuItemRoute.getAll,
    },
    {
      pattern:
        /^\/api\/v1\/business\/(?<businessId>[^/]+)\/menu\/(?<menuId>[^/]+)\/item\/(?<menuItemId>[^/]+)$/,
      handler: menuItemRoute.getOne,
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
      pattern: /^\/api\/v1\/business\/(?<businessId>[^/]+)\/employee$/,
      handler: employeeRoute.post,
    },
    {
      pattern: /^\/api\/v1\/business\/(?<businessId>[^/]+)\/menu$/,
      handler: menuRoute.post,
    },
    {
      pattern:
        /^\/api\/v1\/business\/(?<businessId>[^/]+)\/menu\/(?<menuId>[^/]+)\/item$/,
      handler: menuItemRoute.post,
    },
  ],
};

export default apiRoutes;
