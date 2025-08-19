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
      get: businessRoute.getOne,
      post: businessRoute.post,
    },
  },
  {
    pattern: /^\/api\/v1\/employee$/,
    methods: {
      get: employeeRoute.getAll,
      post: employeeRoute.post,
    },
  },
  {
    pattern: /^\/api\/v1\/employee\/(?<employeeId>[^/]+)$/,
    methods: {
      get: employeeRoute.getOne,
    },
  },
  {
    pattern: /^\/api\/v1\/menu$/,
    methods: {
      get: menuRoute.getAll,
      post: menuRoute.post,
    },
  },
  {
    pattern: /^\/api\/v1\/menu\/(?<menuId>[^/]+)$/,
    methods: {
      get: menuRoute.getOne,
    },
  },
  {
    pattern: /^\/api\/v1\/menu\/(?<menuId>[^/]+)\/item$/,
    methods: {
      get: menuItemRoute.getAll,
      post: menuItemRoute.post,
    },
  },
  {
    pattern: /^\/api\/v1\/menu\/(?<menuId>[^/]+)\/item\/(?<menuItemId>[^/]+)$/,
    methods: {
      get: menuItemRoute.getOne,
    },
  },
  {
    pattern: /^\/api\/v1\/menu-item\/(?<menuItemId>[^/]+)$/,
    methods: {
      get: menuItemRoute.getOne,
    },
  },
  {
    pattern: /^\/api\/v1\/ordered-items$/,
    methods: {
      get: orderItemRoute.getAllByBusinessId,
    },
  },
  {
    pattern: /^\/api\/v1\/table$/,
    methods: {
      get: tableRoute.getAll,
      post: tableRoute.post,
    },
  },
  {
    pattern: /^\/api\/v1\/table\/(?<tableId>[^/]+)$/,
    methods: {
      get: tableRoute.getOne,
    },
  },
  {
    pattern: /^\/api\/v1\/table\/(?<tableId>[^/]+)\/order$/,
    methods: {
      get: orderRoute.getAll,
      post: orderRoute.post,
    },
  },
  {
    pattern: /^\/api\/v1\/table\/(?<tableId>[^/]+)\/order\/(?<orderId>[^/]+)$/,
    methods: {
      get: orderRoute.getOne,
    },
  },
  {
    pattern:
      /^\/api\/v1\/table\/(?<tableId>[^/]+)\/order\/(?<orderId>[^/]+)\/item$/,
    methods: {
      get: orderItemRoute.getAll,
      post: orderItemRoute.post,
    },
  },
  {
    pattern:
      /^\/api\/v1\/table\/(?<tableId>[^/]+)\/order\/(?<orderId>[^/]+)\/item\/(?<orderItemId>[^/]+)$/,
    methods: {
      get: orderItemRoute.getOne,
    },
  },
  {
    pattern: /^\/api\/v1\/session$/,
    methods: {
      post: employeeRoute.login,
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
    role: "manager",
  },
  {
    pattern: /^\/register-me\/?(?:\?.*)?$/,
    filePath: "/register_me/index.html",
  },
  {
    pattern: /^\/create-menu$/,
    filePath: "/create_menu/index.html",
    role: "manager",
  },
  {
    pattern: /^\/invite-employees$/,
    filePath: "/invite_employees/index.html",
    role: "manager",
  },
  {
    pattern: /^\/dashboard$/,
    filePath: "/manager_dashboard/index.html",
    role: "manager",
  },
];

export { apiRoutes, pagesRoutes };
