import MissingParamError from "../../../utils/errors/missing-param-error.js";
import Payment from "../../entities/payment.js";

export default class RegisterPaymentsUseCase {
  constructor({ idGenerator, paymentRepository } = {}) {
    this.idGenerator = idGenerator;
    this.paymentRepository = paymentRepository;
  }

  async execute({ tableSessionId, method, amount } = {}) {
    if (!tableSessionId) throw new MissingParamError("tableSessionId");
    if (!method) throw new MissingParamError("method");
    if (!amount) throw new MissingParamError("amount");

    const id = this.idGenerator.execute();

    const payment = new Payment({
      id,
      tableSessionId,
      method,
      amount,
      status: "completed",
    });

    const createdPayment = await this.paymentRepository.create(payment);

    return createdPayment;
  }
}
