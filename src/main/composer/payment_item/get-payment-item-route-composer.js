import GetPaymentItemRouter from "../../../presentation/routers/payment_item/get-payment-item-router.js";
import GetPaymentItemUseCase from "../../../domain/usecase/payment_item/get-payment-item-usecase.js";
import PaymentItemRepository from "../../../infra/repositories/payment-item-repository.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";
import validators from "../../../utils/validator.js";

const getPaymentItemRouteComposer = {
  execute() {
    const paymentItemRepository = new PaymentItemRepository({
      postgresAdapter,
    });
    const getPaymentItemUseCase = new GetPaymentItemUseCase({
      paymentItemRepository,
    });
    const getpaymentItemRouter = new GetPaymentItemRouter({
      getPaymentItemUseCase,
      validators,
    });
    return getpaymentItemRouter;
  },
};

export default getPaymentItemRouteComposer;
