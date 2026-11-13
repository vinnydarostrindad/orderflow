import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../http-response.js";

export default class GetPaymentItemRouter {
  constructor({ getPaymentItemUseCase, validators } = {}) {
    this.getPaymentItemUseCase = getPaymentItemUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { paymentId, paymentItemId } = httpRequest.params;

    if (!paymentId) {
      return httpResponse.badRequest(new MissingParamError("paymentId"));
    }
    if (!this.validators.uuid(paymentId)) {
      return httpResponse.badRequest(new InvalidParamError("paymentId"));
    }

    if (!paymentItemId) {
      const paymentItems = await this.getPaymentItemUseCase.execute({
        paymentId,
      });

      const editedPaymentItems = paymentItems.map(
        ({ id, payment_id, order_item_id, quantity, amount, created_at }) => ({
          id,
          paymentId: payment_id,
          orderItemId: order_item_id,
          quantity: quantity.toString(),
          amount,
          createdAt: created_at,
        }),
      );

      return httpResponse.ok(editedPaymentItems);
    }

    if (!this.validators.uuid(paymentItemId)) {
      return httpResponse.badRequest(new InvalidParamError("paymentItemId"));
    }

    const paymentItem = await this.getPaymentItemUseCase.execute({
      paymentId,
      paymentItemId,
    });

    if (!paymentItem) {
      return httpResponse.notFound("Payment", "Make sure order item exists.");
    }

    const { id, payment_id, order_item_id, quantity, amount, created_at } =
      paymentItem;

    return httpResponse.ok({
      id,
      paymentId: payment_id,
      orderItemId: order_item_id,
      quantity: quantity.toString(),
      amount,
      createdAt: created_at,
    });
  }
}
