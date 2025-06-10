import registerMenuListRouterComposer from "../composer/menu_item/register-menu-item-router-composer.js";

const menuItemRoute = {
  post: async (httpRequest) => {
    const registerMenuListRouter = registerMenuListRouterComposer.execute();
    return await registerMenuListRouter.route(httpRequest);
  },
};

export default menuItemRoute;
