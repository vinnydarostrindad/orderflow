import RegisterPaymentRouter from "../../../presentation/routers/payments/register-payments-router.js";
import RegisterPaymentUseCase from "../../../domain/usecase/payments/register-payments-usecase.js";
import PaymentRepository from "../../../infra/repositories/payment-repository.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";
import validators from "../../../utils/validator.js";
import idGenerator from "../../../utils/id-generator.js";

const registerPaymentRouterComposer = {
  execute() {
    const paymentRepository = new PaymentRepository({ postgresAdapter });
    const registerPaymentsUseCase = new RegisterPaymentUseCase({
      paymentRepository,
      idGenerator,
    });
    const registerPaymentRouter = new RegisterPaymentRouter({
      registerPaymentsUseCase,
      validators,
    });
    return registerPaymentRouter;
  },
};

export default registerPaymentRouterComposer;
