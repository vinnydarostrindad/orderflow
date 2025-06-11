import getMenuItemRouterComposer from "../composer/menu_item/get-menu-item-router-composer.js";
import registerMenuItemRouterComposer from "../composer/menu_item/register-menu-item-router-composer.js";

const menuItemRoute = {
  getAll: async (httpRequest) => {
    const getMenuItemRouter = getMenuItemRouterComposer.execute();
    return await getMenuItemRouter.route(httpRequest);
  },
  getOne: async (httpRequest) => {
    const getMenuItemRouter = getMenuItemRouterComposer.execute();
    return await getMenuItemRouter.route(httpRequest);
  },
  post: async (httpRequest) => {
    const registerMenuItemRouter = registerMenuItemRouterComposer.execute();
    return await registerMenuItemRouter.route(httpRequest);
  },
};

export default menuItemRoute;
