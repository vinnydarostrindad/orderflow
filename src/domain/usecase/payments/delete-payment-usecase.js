import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class DeletePaymentUseCase {
  constructor({ paymentRepository } = {}) {
    this.paymentRepository = paymentRepository;
  }

  async execute({ tableSessionId, paymentId } = {}) {
    if (!tableSessionId) throw new MissingParamError("tableSessionId");
    if (!paymentId) throw new MissingParamError("paymentId");

    return await this.paymentRepository.deleteById(tableSessionId, paymentId);
  }
}
