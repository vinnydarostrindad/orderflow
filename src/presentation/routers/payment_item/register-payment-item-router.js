import MissingParamError from "../../../utils/errors/missing-param-error.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import httpResponse from "../../http-response.js";

export default class RegisterPaymentItemRouter {
  constructor({ registerPaymentItemUseCase, validators } = {}) {
    this.registerPaymentItemUseCase = registerPaymentItemUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { paymentId } = httpRequest.params;
    const { orderItemId, quantity, amount } = httpRequest.body;

    if (!paymentId) {
      return httpResponse.badRequest(new MissingParamError("paymentId"));
    }
    if (!this.validators.uuid(paymentId)) {
      return httpResponse.badRequest(new InvalidParamError("paymentId"));
    }
    if (!orderItemId) {
      return httpResponse.badRequest(new MissingParamError("orderItemId"));
    }
    if (!this.validators.uuid(orderItemId)) {
      return httpResponse.badRequest(new InvalidParamError("orderItemId"));
    }
    if (!quantity) {
      return httpResponse.badRequest(new MissingParamError("quantity"));
    }
    if (!amount) {
      return httpResponse.badRequest(new MissingParamError("amount"));
    }

    const paymentItem = await this.registerPaymentItemUseCase.execute({
      paymentId,
      orderItemId,
      quantity,
      amount,
    });

    return httpResponse.created({
      id: paymentItem.id,
      paymentId: paymentItem.payment_id,
      orderItemId: paymentItem.order_item_id,
      quantity: paymentItem.quantity.toString(),
      amount: paymentItem.amount,
      createdAt: paymentItem.created_at,
      updatedAt: paymentItem.updated_at,
    });
  }
}
