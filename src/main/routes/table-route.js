import registerTableRouterComposer from "../composer/table/register-table-router-composer.js";

const tableRoute = {
  post: async (httpRequest) => {
    const registerTableRouter = registerTableRouterComposer.execute();
    return await registerTableRouter.route(httpRequest);
  },
};

export default tableRoute;
