import getEmployeeRouterComposer from "../composer/employee/get-employee-router-composer.js";
import loginEmployeeRouterComposer from "../composer/employee/login-employee-router-composer.js";
import registerEmployeeRouterComposer from "../composer/employee/register-employee-router-composer.js";

const employeeRoute = {
  getAll: async (httpRequest) => {
    const getEmployeeRouter = getEmployeeRouterComposer.execute();
    return await getEmployeeRouter.route(httpRequest);
  },
  getOne: async (httpRequest) => {
    const getEmployeeRouter = getEmployeeRouterComposer.execute();
    return await getEmployeeRouter.route(httpRequest);
  },
  post: async (httpRequest) => {
    const registerEmployeeRouter = registerEmployeeRouterComposer.execute();
    return await registerEmployeeRouter.route(httpRequest);
  },
  login: async (httpRequest) => {
    const loginEmployeeRouter = loginEmployeeRouterComposer.execute();
    return await loginEmployeeRouter.route(httpRequest);
  },
};

export default employeeRoute;
