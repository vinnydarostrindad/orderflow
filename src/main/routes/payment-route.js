import registerPaymentRouterComposer from "../composer/payment/register-payment-router-composer.js";
import getPaymentRouterComposer from "../composer/payment/get-payment-router-composer.js";

const paymentRoute = {
  post: async (httpRequest) => {
    const registerPaymentRouter = registerPaymentRouterComposer.execute();
    return await registerPaymentRouter.route(httpRequest);
  },
  getOne: async (httpRequest) => {
    const getPaymentRouter = getPaymentRouterComposer.execute();
    return await getPaymentRouter.route(httpRequest);
  },
  getAllByTableSessionId: async (httpRequest) => {
    const getPaymentRouter = getPaymentRouterComposer.execute();
    return await getPaymentRouter.route(httpRequest);
  },
  getAllByBusinessId: async (httpRequest) => {
    const getPaymentRouter = getPaymentRouterComposer.execute();
    return await getPaymentRouter.route(httpRequest);
  },
};

export default paymentRoute;
