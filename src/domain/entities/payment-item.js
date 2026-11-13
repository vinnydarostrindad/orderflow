import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class PaymentItem {
  constructor({ id, paymentId, orderItemId, quantity, amount } = {}) {
    this.validate(id, paymentId, orderItemId, quantity, amount);

    this.id = id;
    this.paymentId = paymentId;
    this.orderItemId = orderItemId;
    this.quantity = quantity;
    this.amount = amount;
  }

  validate(id, paymentId, orderItemId, quantity, amount) {
    if (!id) throw new MissingParamError("id");
    if (!paymentId) throw new MissingParamError("paymentId");
    if (!orderItemId) throw new MissingParamError("orderItemId");
    if (!quantity) throw new MissingParamError("quantity");
    if (!amount) throw new MissingParamError("amount");
  }
}
