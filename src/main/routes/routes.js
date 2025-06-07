import businessRoute from "./business-route.js";
import employeeRoute from "./employee-route.js";
import migrationRoute from "./migration-route.js";

const apiRoutes = {
  get: [
    {
      pattern: /^\/api\/v1\/migrations$/,
      handler: async ({ req }) => {
        return await migrationRoute.get(req);
      },
    },
    {
      pattern: /^\/api\/v1\/business\/([^/]+)$/,
      handler: async ({ params }) => {
        const [business_id] = params;
        return await businessRoute.getOne(business_id);
      },
    },
    {
      pattern: /^\/api\/v1\/business\/([^/]+)\/employee$/,
      handler: async ({ params }) => {
        const [business_id] = params;
        return await employeeRoute.getAll(business_id);
      },
    },
    {
      pattern: /^\/api\/v1\/business\/([^/]+)\/employee\/([^/]+)$/,
      handler: async ({ params }) => {
        const [business_id, employee_id] = params;
        return await employeeRoute.getOne(business_id, employee_id);
      },
    },
  ],
  post: [
    {
      pattern: /^\/api\/v1\/migrations$/,
      handler: async ({ req }) => {
        return await migrationRoute.post(req);
      },
    },
    {
      pattern: /^\/api\/v1\/business$/,
      handler: async ({ req }) => {
        return await businessRoute.post(req);
      },
    },
    {
      pattern: /^\/api\/v1\/business\/([^/]+)\/employee$/,
      handler: async ({ req, params }) => {
        const [business_id] = params;
        return await employeeRoute.post(req, business_id);
      },
    },
  ],
};

export default apiRoutes;
