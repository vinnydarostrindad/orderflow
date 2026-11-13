import migrationRoute from "./migration-route.js";
import businessRoute from "./business-route.js";
import employeeRoute from "./employee-route.js";
import menuRoute from "./menu-route.js";
import menuItemRoute from "./menu-item-route.js";
import tableRoute from "./table-route.js";
import orderItemRoute from "./order-item-route.js";
import tableSessionRoute from "./table-session-route.js";
import paymentRoute from "./payment-route.js";
import paymentItemRoute from "./payment-item-route.js";

const apiRoutes = [
  {
    pattern: /^\/api\/v1\/migrations$/,
    methods: {
      get: migrationRoute.get,
      post: migrationRoute.post,
    },
  },
  {
    pattern: /^\/api\/v1\/businesses$/,
    methods: {
      get: businessRoute.getOne,
      post: businessRoute.post,
    },
  },
  {
    pattern: /^\/api\/v1\/employees$/,
    methods: {
      get: employeeRoute.getAll,
      post: employeeRoute.post,
    },
  },
  {
    pattern: /^\/api\/v1\/employees\/(?<employeeId>[^/]+)$/,
    methods: {
      get: employeeRoute.getOne,
    },
  },
  {
    pattern: /^\/api\/v1\/menus$/,
    methods: {
      get: menuRoute.getAll,
      post: menuRoute.post,
    },
  },
  {
    pattern: /^\/api\/v1\/menus\/(?<menuId>[^/]+)$/,
    methods: {
      get: menuRoute.getOne,
    },
  },
  {
    pattern: /^\/api\/v1\/menus\/(?<menuId>[^/]+)\/items$/,
    methods: {
      get: menuItemRoute.getAll,
      post: menuItemRoute.post,
    },
  },
  {
    pattern:
      /^\/api\/v1\/menus\/(?<menuId>[^/]+)\/items\/(?<menuItemId>[^/]+)$/,
    methods: {
      get: menuItemRoute.getOne,
    },
  },
  {
    pattern: /^\/api\/v1\/menu-items\/(?<menuItemId>[^/]+)$/,
    methods: {
      get: menuItemRoute.getOne,
    },
  },
  {
    pattern: /^\/api\/v1\/ordered-items\/?(?:\?.*)?$/,
    methods: {
      get: orderItemRoute.getAllByBusinessId,
    },
  },
  {
    pattern: /^\/api\/v1\/tables$/,
    methods: {
      get: tableRoute.getAll,
      post: tableRoute.post,
    },
  },
  {
    pattern: /^\/api\/v1\/tables\/(?<tableId>[^/]+)$/,
    methods: {
      get: tableRoute.getOne,
    },
  },
  {
    pattern: /^\/api\/v1\/table-sessions\/(?<tableSessionId>[^/]+)\/items$/,
    methods: {
      get: orderItemRoute.getAll,
      post: orderItemRoute.post,
    },
  },
  {
    pattern:
      /^\/api\/v1\/table-sessions\/(?<tableSessionId>[^/]+)\/items\/(?<orderItemId>[^/]+)$/,
    methods: {
      get: orderItemRoute.getOne,
      patch: orderItemRoute.patch,
    },
  },
  {
    pattern: /^\/api\/v1\/table-sessions$/,
    methods: {
      post: tableSessionRoute.post,
    },
  },
  {
    pattern: /^\/api\/v1\/table-sessions\/open$/,
    methods: {
      get: tableSessionRoute.getAll,
    },
  },
  {
    pattern: /^\/api\/v1\/table-sessions\/(?<tableId>[^/]+)$/,
    methods: {
      get: tableSessionRoute.getOne,
    },
  },
  {
    pattern: /^\/api\/v1\/table-sessions\/(?<tableSessionId>[^/]+)\/close$/,
    methods: {
      patch: tableSessionRoute.close,
    },
  },
  {
    pattern: /^\/api\/v1\/table-sessions\/(?<tableSessionId>[^/]+)\/payments$/,
    methods: {
      post: paymentRoute.post,
      get: paymentRoute.getAllByTableSessionId,
    },
  },
  {
    pattern:
      /^\/api\/v1\/table-sessions\/(?<tableSessionId>[^/]+)\/payments\/(?<paymentId>[^/]+)$/,
    methods: {
      get: paymentRoute.getOne,
      delete: paymentRoute.delete,
    },
  },
  {
    pattern: /^\/api\/v1\/payments$/,
    methods: {
      get: paymentRoute.getAllByBusinessId,
    },
  },
  {
    pattern:
      /^\/api\/v1\/table-sessions\/(?<tableSessionId>[^/]+)\/payments\/(?<paymentId>[^/]+)\/items$/,
    methods: {
      post: paymentItemRoute.post,
      get: paymentItemRoute.getAllByPaymentId,
    },
  },
  {
    pattern:
      /^\/api\/v1\/table-sessions\/(?<tableSessionId>[^/]+)\/payments\/(?<paymentId>[^/]+)\/items\/(?<paymentItemId>[^/]+)$/,
    methods: {
      get: paymentItemRoute.getOne,
    },
  },
  {
    pattern: /^\/api\/v1\/sessions$/,
    methods: {
      post: employeeRoute.login,
    },
  },
];

const managerPages = [
  {
    pattern: /^\/register-employees\/?(?:\?.*)?$/,
    filePath: "/manager/register_employees/index.html",
    role: "manager",
  },
  {
    pattern: /^\/register-me\/?(?:\?.*)?$/,
    filePath: "/manager/register_me/index.html",
  },
  {
    pattern: /^\/create-menu\/?(?:\?.*)?$/,
    filePath: "/manager/create_menu/index.html",
    role: "manager",
  },
  {
    pattern: /^\/invite-employees\/?(?:\?.*)?$/,
    filePath: "/manager/invite_employees/index.html",
    role: "manager",
  },
  {
    pattern: /^\/dashboard\/?(?:\?.*)?$/,
    filePath: "/manager/dashboard/index.html",
    role: "manager",
  },
];

const waiterPages = [
  {
    pattern: /^\/table-sessions\/?(?:\?.*)?$/,
    filePath: "/waiter/tables/index.html",
    role: "waiter",
  },
  {
    pattern: /^\/table-sessions\/(?<tableSessionId>[^/]+)\/?(?:\?.*)?$/,
    filePath: "/waiter/table-info/index.html",
    role: "waiter",
  },
  {
    pattern: /^\/clients\/?(?:\?.*)?$/,
    filePath: "/waiter/clients/index.html",
    role: "waiter",
  },
  {
    pattern: /^\/menus\/?(?:\?.*)?$/,
    filePath: "/waiter/menus/index.html",
    role: "waiter",
  },
  {
    pattern: /^\/menu\/(?<menuId>[^/]+)\/?(?:\?.*)?$/,
    filePath: "/waiter/menu_items/index.html",
    role: "waiter",
  },
  {
    pattern:
      /^\/menu\/(?<menuId>[^/]+)\/item\/(?<menuItemId>[^/]+)\/?(?:\?.*)?$/,
    filePath: "/waiter/order_menu_item/index.html",
    role: "waiter",
  },
  {
    pattern: /^\/waiter\/orders\/?(?:\?.*)?$/,
    filePath: "/waiter/orders/index.html",
    role: "waiter",
  },
];

const cookPages = [
  {
    pattern: /^\/orders\/?(?:\?.*)?$/,
    filePath: "/cook/index.html",
    role: "cook",
  },
  {
    pattern: /^\/orders\/history\/?(?:\?.*)?$/,
    filePath: "/cook/history/index.html",
    role: "cook",
  },
];

const cashierPages = [
  {
    pattern: /^\/cashier\/?(?:\?.*)?$/,
    filePath: "/cashier/tables/index.html",
    role: "cashier",
  },
  {
    pattern:
      /^\/table-sessions\/(?<tableSessionId>[^/]+)\/pagamento?(?:\?.*)?$/,
    filePath: "/cashier/table-payment/index.html",
    role: "cashier",
  },
];

const pagesRoutes = [
  {
    pattern: /^\/(?:\?.*)?$/,
    filePath: "/index.html",
  },
  {
    pattern: /^\/login\/?(?:\?.*)?$/,
    filePath: "/login/index.html",
  },
  ...managerPages,
  ...waiterPages,
  ...cookPages,
  ...cashierPages,
];

export { apiRoutes, pagesRoutes };
