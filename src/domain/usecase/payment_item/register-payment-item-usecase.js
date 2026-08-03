import MissingParamError from "../../../utils/errors/missing-param-error.js";
import PaymentItem from "../../entities/payment-item.js";

export default class RegisterPaymentItemUseCase {
  constructor({ idGenerator, paymentItemRepository } = {}) {
    this.idGenerator = idGenerator;
    this.paymentItemRepository = paymentItemRepository;
  }

  async execute({ paymentId, orderItemId, quantity, amount } = {}) {
    if (!paymentId) throw new MissingParamError("paymentId");
    if (!orderItemId) throw new MissingParamError("orderItemId");
    if (!quantity) throw new MissingParamError("quantity");
    if (!amount) throw new MissingParamError("amount");

    const id = this.idGenerator.execute();

    const paymentItem = new PaymentItem({
      id,
      paymentId,
      orderItemId,
      quantity,
      amount,
    });

    const createdPaymentItem =
      await this.paymentItemRepository.create(paymentItem);

    return createdPaymentItem;
  }
}
