import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class GetPaymentItemUseCase {
  constructor({ paymentItemRepository } = {}) {
    this.paymentItemRepository = paymentItemRepository;
  }

  async execute({ paymentId, paymentItemId } = {}) {
    if (!paymentId) throw new MissingParamError("paymentId");

    if (!paymentItemId) {
      return this.paymentItemRepository.findAllByPaymentId(paymentId);
    }

    const paymentItems = await this.paymentItemRepository.findById(
      paymentId,
      paymentItemId,
    );

    if (!paymentItems) return null;

    return paymentItems;
  }
}
