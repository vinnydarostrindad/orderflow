import GetPaymentRouter from "../../../presentation/routers/payments/get-payments-router.js";
import GetPaymentUseCase from "../../../domain/usecase/payments/get-payments-usecase.js";
import PaymentRepository from "../../../infra/repositories/payment-repository.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";
import validators from "../../../utils/validator.js";

const getPaymentRouterComposer = {
  execute() {
    const paymentRepository = new PaymentRepository({ postgresAdapter });
    const getPaymentUseCase = new GetPaymentUseCase({ paymentRepository });
    return new GetPaymentRouter({ getPaymentUseCase, validators });
  },
};

export default getPaymentRouterComposer;
