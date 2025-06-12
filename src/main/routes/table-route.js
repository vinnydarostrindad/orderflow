import registerTableRouterComposer from "../composer/table/register-table-router-composer.js";
import getTableRouterComposer from "../composer/table/get-table-router-composer.js";

const tableRoute = {
  post: async (httpRequest) => {
    const registerTableRouter = registerTableRouterComposer.execute();
    return await registerTableRouter.route(httpRequest);
  },
  getAll: async (httpRequest) => {
    const getTableRouter = getTableRouterComposer.execute();
    return await getTableRouter.route(httpRequest);
  },
  getOne: async (httpRequest) => {
    const getTableRouter = getTableRouterComposer.execute();
    return await getTableRouter.route(httpRequest);
  },
};

export default tableRoute;
