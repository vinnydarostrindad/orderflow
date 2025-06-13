import registerOrderRouterComposer from "../composer/order/register-order-router-composer.js";
import getOrderRouterComposer from "../composer/order/get-order-router-composer.js";

const orderRoute = {
  post: async (httpRequest) => {
    const registerOrderRouter = registerOrderRouterComposer.execute();
    return await registerOrderRouter.route(httpRequest);
  },
  getAll: async (httpRequest) => {
    const getOrderRouter = getOrderRouterComposer.execute();
    return await getOrderRouter.route(httpRequest);
  },
  getOne: async (httpRequest) => {
    const getOrderRouter = getOrderRouterComposer.execute();
    return await getOrderRouter.route(httpRequest);
  },
};

export default orderRoute;
