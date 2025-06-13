import registerOrderRouterComposer from "../composer/order/register-order-router-composer.js";

const orderRoute = {
  post: async (httpRequest) => {
    const registerOrderRouter = registerOrderRouterComposer.execute();
    return await registerOrderRouter.route(httpRequest);
  },
};

export default orderRoute;
