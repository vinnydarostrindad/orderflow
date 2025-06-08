import getBusinessRouterComposer from "../composer/business/get-business-router-composer.js";
import registerBusinessRouterComposer from "../composer/business/register-business-router-composer.js";

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
