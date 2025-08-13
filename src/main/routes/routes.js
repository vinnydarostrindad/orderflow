import migrationRoute from "./migration-route.js";
import businessRoute from "./business-route.js";
import employeeRoute from "./employee-route.js";
import menuRoute from "./menu-route.js";
import menuItemRoute from "./menu-item-route.js";
import tableRoute from "./table-route.js";
import orderRoute from "./order-route.js";
import orderItemRoute from "./order-item-route.js";

const apiRoutes = [
  {
    pattern: /^\/api\/v1\/migrations$/,
    methods: {
      get: migrationRoute.get,
      post: migrationRoute.post,
    },
  },
  {
    pattern: /^\/api\/v1\/business$/,
    methods: {
      post: businessRoute.post,
    },
  },
  {
    pattern: /^\/api\/v1\/business\/(?<businessId>[^/]+)$/,
    methods: {
      get: businessRoute.getOne,
    },
  },
  {
    pattern: /^\/api\/v1\/business\/(?<businessId>[^/]+)\/employee$/,
    methods: {
      get: employeeRoute.getAll,
      post: employeeRoute.post,
    },
  },
  {
    pattern:
      /^\/api\/v1\/business\/(?<businessId>[^/]+)\/employee\/(?<employeeId>[^/]+)$/,
    methods: {
      get: employeeRoute.getOne,
    },
  },
  {
    pattern: /^\/api\/v1\/business\/(?<businessId>[^/]+)\/menu$/,
    methods: {
      get: menuRoute.getAll,
      post: menuRoute.post,
    },
  },
  {
    pattern:
      /^\/api\/v1\/business\/(?<businessId>[^/]+)\/menu\/(?<menuId>[^/]+)$/,
    methods: {
      get: menuRoute.getOne,
    },
  },
  {
    pattern:
      /^\/api\/v1\/business\/(?<businessId>[^/]+)\/menu\/(?<menuId>[^/]+)\/item$/,
    methods: {
      get: menuItemRoute.getAll,
      post: menuItemRoute.post,
    },
  },
  {
    pattern:
      /^\/api\/v1\/business\/(?<businessId>[^/]+)\/menu\/(?<menuId>[^/]+)\/item\/(?<menuItemId>[^/]+)$/,
    methods: {
      get: menuItemRoute.getOne,
    },
  },
  {
    pattern:
      /^\/api\/v1\/business\/(?<businessId>[^/]+)\/menu-item\/(?<menuItemId>[^/]+)$/,
    methods: {
      get: menuItemRoute.getOne,
    },
  },
  {
    pattern: /^\/api\/v1\/business\/(?<businessId>[^/]+)\/ordered-items$/,
    methods: {
      get: orderItemRoute.getAllByBusinessId,
    },
  },
  {
    pattern: /^\/api\/v1\/business\/(?<businessId>[^/]+)\/table$/,
    methods: {
      get: tableRoute.getAll,
      post: tableRoute.post,
    },
  },
  {
    pattern:
      /^\/api\/v1\/business\/(?<businessId>[^/]+)\/table\/(?<tableId>[^/]+)$/,
    methods: {
      get: tableRoute.getOne,
    },
  },
  {
    pattern:
      /^\/api\/v1\/business\/(?<businessId>[^/]+)\/table\/(?<tableId>[^/]+)\/order$/,
    methods: {
      get: orderRoute.getAll,
      post: orderRoute.post,
    },
  },
  {
    pattern:
      /^\/api\/v1\/business\/(?<businessId>[^/]+)\/table\/(?<tableId>[^/]+)\/order\/(?<orderId>[^/]+)$/,
    methods: {
      get: orderRoute.getOne,
    },
  },
  {
    pattern:
      /^\/api\/v1\/business\/(?<businessId>[^/]+)\/table\/(?<tableId>[^/]+)\/order\/(?<orderId>[^/]+)\/item$/,
    methods: {
      get: orderItemRoute.getAll,
      post: orderItemRoute.post,
    },
  },
  {
    pattern:
      /^\/api\/v1\/business\/(?<businessId>[^/]+)\/table\/(?<tableId>[^/]+)\/order\/(?<orderId>[^/]+)\/item\/(?<orderItemId>[^/]+)$/,
    methods: {
      get: orderItemRoute.getOne,
    },
  },
];

const pagesRoutes = [
  {
    pattern: /^\/$/,
    filePath: "/index.html",
  },
  {
    pattern: /^\/register-employees\/?(?:\?.*)?$/,
    filePath: "/register_employees/index.html",
  },
  {
    pattern: /^\/create-menu$/,
    filePath: "/create_menu/index.html",
  },
  {
    pattern: /^\/invite-employees$/,
    filePath: "/invite_employees/index.html",
  },
  {
    pattern: /^\/dashboard$/,
    filePath: "/maneger_dashboard/index.html",
  },
];

export { apiRoutes, pagesRoutes };
