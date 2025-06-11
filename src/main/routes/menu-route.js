import registerMenuRouterComposer from "../composer/menu/register-menu-router-composer.js";
import getMenuRouterComposer from "../composer/menu/get-menu-router-composer.js";

const menuRoute = {
  post: async (httpRequest) => {
    const registerMenuRouter = registerMenuRouterComposer.execute();
    return await registerMenuRouter.route(httpRequest);
  },
  getAll: async (httpRequest) => {
    const getMenuRouter = getMenuRouterComposer.execute();
    return await getMenuRouter.route(httpRequest);
  },
  getOne: async (httpRequest) => {
    const getMenuRouter = getMenuRouterComposer.execute();
    return await getMenuRouter.route(httpRequest);
  },
};

export default menuRoute;
