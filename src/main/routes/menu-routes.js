import registerMenuRouterComposer from "../composer/menu/register-menu-router-composer.js";

const menuRoute = {
  post: async (httpRequest) => {
    const registerMenuRouter = registerMenuRouterComposer.execute();
    return await registerMenuRouter.route(httpRequest);
  },
};

export default menuRoute;
