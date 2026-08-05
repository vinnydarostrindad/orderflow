import RegisterPaymentItemRouter from "../../../presentation/routers/payment_item/register-payment-item-router.js";
import RegisterPaymentItemUseCase from "../../../domain/usecase/payment_item/register-payment-item-usecase.js";
import PaymentItemRepository from "../../../infra/repositories/payment-item-repository.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";
import validators from "../../../utils/validator.js";
import idGenerator from "../../../utils/id-generator.js";

const registerPaymentItemRouteComposer = {
  execute() {
    const paymentItemRepository = new PaymentItemRepository({
      postgresAdapter,
    });
    const registerPaymentItemUseCase = new RegisterPaymentItemUseCase({
      paymentItemRepository,
      idGenerator,
    });
    return new RegisterPaymentItemRouter({
      registerPaymentItemUseCase,
      validators,
    });
  },
};

export default registerPaymentItemRouteComposer;
