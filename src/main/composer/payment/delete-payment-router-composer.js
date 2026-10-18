import DeletePaymentRouter from "../../../presentation/routers/payments/delete-payment-router.js";
import DeletePaymentUseCase from "../../../domain/usecase/payments/delete-payment-usecase.js";
import PaymentRepository from "../../../infra/repositories/payment-repository.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";
import validators from "../../../utils/validator.js";

const deletePaymentRouterComposer = {
  execute() {
    const paymentRepository = new PaymentRepository({ postgresAdapter });
    const deletePaymentUseCase = new DeletePaymentUseCase({
      paymentRepository,
    });
    return new DeletePaymentRouter({ deletePaymentUseCase, validators });
  },
};

export default deletePaymentRouterComposer;
