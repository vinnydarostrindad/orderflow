import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class GetPaymentUseCase {
  constructor({ paymentRepository } = {}) {
    this.paymentRepository = paymentRepository;
  }

  async execute({ businessId, tableSessionId, paymentId } = {}) {
    if (!tableSessionId) {
      if (!businessId) throw new MissingParamError("businessId");

      return this.paymentRepository.findAllByBusinessId(businessId);
    }

    if (!paymentId) {
      return this.paymentRepository.findAllByTableSessionId(tableSessionId);
    }

    const payment = await this.paymentRepository.findById(
      tableSessionId,
      paymentId,
    );

    if (!payment) return null;

    return payment;
  }
}
