import migrationRoute from "./migration-route.js";
import businessRoute from "./business-route.js";
import employeeRoute from "./employee-route.js";
import menuRoute from "./menu-route.js";
import menuItemRoute from "./menu-item-route.js";
import tableRoute from "./table-route.js";
import orderRoute from "./order-route.js";
import orderItemRoute from "./order-item-route.js";

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
    {
      pattern: /^\/api\/v1\/business\/(?<businessId>[^/]+)\/table$/,
      handler: tableRoute.getAll,
    },
    {
      pattern:
        /^\/api\/v1\/business\/(?<businessId>[^/]+)\/table\/(?<tableId>[^/]+)$/,
      handler: tableRoute.getOne,
    },
    {
      pattern:
        /^\/api\/v1\/business\/(?<businessId>[^/]+)\/table\/(?<tableId>[^/]+)\/order$/,
      handler: orderRoute.getAll,
    },
    {
      pattern:
        /^\/api\/v1\/business\/(?<businessId>[^/]+)\/table\/(?<tableId>[^/]+)\/order\/(?<orderId>[^/]+)$/,
      handler: orderRoute.getOne,
    },
    {
      pattern:
        /^\/api\/v1\/business\/(?<businessId>[^/]+)\/table\/(?<tableId>[^/]+)\/order\/(?<orderId>[^/]+)\/item$/,
      handler: orderItemRoute.getAll,
    },
    {
      pattern:
        /^\/api\/v1\/business\/(?<businessId>[^/]+)\/table\/(?<tableId>[^/]+)\/order\/(?<orderId>[^/]+)\/item\/(?<orderItemId>[^/]+)$/,
      handler: orderItemRoute.getOne,
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
    {
      pattern: /^\/api\/v1\/business\/(?<businessId>[^/]+)\/table$/,
      handler: tableRoute.post,
    },
    {
      pattern:
        /^\/api\/v1\/business\/(?<businessId>[^/]+)\/table\/(?<tableId>[^/]+)\/order$/,
      handler: orderRoute.post,
    },
    {
      pattern:
        /^\/api\/v1\/business\/(?<businessId>[^/]+)\/table\/(?<tableId>[^/]+)\/order\/(?<orderId>[^/]+)\/item$/,
      handler: orderItemRoute.post,
    },
  ],
};

export default apiRoutes;
