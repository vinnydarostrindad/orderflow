import getBusinessRouterComposer from "../composer/get-business-router-composer.js";
import registerBusinessRouterComposer from "../composer/register-business-router-composer.js";

const businessRoute = {
  getOne: async (httpRequest) => {
    const getBusinessRouter = getBusinessRouterComposer.execute();
    return await getBusinessRouter.route(httpRequest);
  },
  post: async (httpRequest) => {
    const registerBusinessRouter = registerBusinessRouterComposer.execute();
    return await registerBusinessRouter.route(httpRequest);
  },
};

export default businessRoute;
