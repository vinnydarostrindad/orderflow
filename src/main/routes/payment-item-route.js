import registerPaymentItemRouteComposer from "../composer/payment_item/register-payment-item-route-composer.js";
import getPaymentItemRouteComposer from "../composer/payment_item/get-payment-item-route-composer.js";

const paymentItemRoute = {
  post: async (httpRequest) => {
    const registerPaymentItemRoute = registerPaymentItemRouteComposer.execute();
    return await registerPaymentItemRoute.route(httpRequest);
  },
  getAllByPaymentId: async (httpRequest) => {
    const getPaymentItemRoute = getPaymentItemRouteComposer.execute();
    return await getPaymentItemRoute.route(httpRequest);
  },
  getOne: async (httpRequest) => {
    const getPaymentItemRoute = getPaymentItemRouteComposer.execute();
    return await getPaymentItemRoute.route(httpRequest);
  },
};

export default paymentItemRoute;
