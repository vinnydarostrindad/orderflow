import getEmployeeRouterComposer from "../composer/get-employee-router-composer.js";
import registerEmployeeRouterComposer from "../composer/register-employee-router-composer.js";
import parseBody from "../middlewares/parse-body.js";

const employeeRoute = {
  getAll: async (business_id) => {
    const httpRequest = { params: { business_id } };

    const getEmployeeRouter = getEmployeeRouterComposer.execute();
    return await getEmployeeRouter.route(httpRequest);
  },
  getOne: async (business_id, employee_id) => {
    const httpRequest = { params: { business_id, employee_id } };

    const getEmployeeRouter = getEmployeeRouterComposer.execute();
    return await getEmployeeRouter.route(httpRequest);
  },
  post: async (req, business_id) => {
    const body = await parseBody(req);

    const httpRequest = { body: { ...body, business_id } };

    const registerEmployeeRouter = registerEmployeeRouterComposer.execute();
    return await registerEmployeeRouter.route(httpRequest);
  },
};

export default employeeRoute;
