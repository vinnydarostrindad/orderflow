import getOrderItemRouterComposer from "../composer/order_item/get-order-item-router-composer.js";
import registerOrderItemRouterComposer from "../composer/order_item/register-order-item-router-composer.js";
import updateOrderItemRouterComposer from "../composer/order_item/update-order-item-router-composer.js";

const orderItemRoute = {
  getAll: async (httpRequest) => {
    const getOrderItemRouter = getOrderItemRouterComposer.execute();
    return await getOrderItemRouter.route(httpRequest);
  },
  getAllByBusinessId: async (httpRequest) => {
    const getOrderItemRouter = getOrderItemRouterComposer.execute();
    return await getOrderItemRouter.route(httpRequest);
  },
  getOne: async (httpRequest) => {
    const getOrderItemRouter = getOrderItemRouterComposer.execute();
    return await getOrderItemRouter.route(httpRequest);
  },
  post: async (httpRequest) => {
    const registerOrderItemRouter = registerOrderItemRouterComposer.execute();
    return await registerOrderItemRouter.route(httpRequest);
  },
  patch: async (httpRequest) => {
    const updateOrderItemRouter = updateOrderItemRouterComposer.execute();
    return await updateOrderItemRouter.route(httpRequest);
  },
};

export default orderItemRoute;
