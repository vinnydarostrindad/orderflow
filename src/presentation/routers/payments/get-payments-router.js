import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../http-response.js";

export default class GetPaymentRouter {
  constructor({ getPaymentUseCase, validators } = {}) {
    this.getPaymentUseCase = getPaymentUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { tableSessionId, paymentId } = httpRequest.params;
    const { businessId } = httpRequest.auth;

    if (!tableSessionId) {
      if (!businessId) {
        return httpResponse.badRequest(new MissingParamError("businessId"));
      }
      if (!this.validators.uuid(businessId)) {
        return httpResponse.badRequest(new InvalidParamError("businessId"));
      }

      const payments = await this.getPaymentUseCase.execute({ businessId });

      const editedPayments = payments.map(
        ({ id, table_session_id, method, amount, status, created_at }) => ({
          id,
          tableSessionId: table_session_id,
          method,
          amount,
          status,
          createdAt: created_at,
        }),
      );
      return httpResponse.ok(editedPayments);
    }

    if (!this.validators.uuid(tableSessionId)) {
      return httpResponse.badRequest(new InvalidParamError("tableSessionId"));
    }

    if (!paymentId) {
      const payments = await this.getPaymentUseCase.execute({
        tableSessionId,
      });

      const editedPayments = payments.map(
        ({ id, table_session_id, method, amount, status, created_at }) => ({
          id,
          tableSessionId: table_session_id,
          method,
          amount,
          status,
          createdAt: created_at,
        }),
      );

      return httpResponse.ok(editedPayments);
    }

    if (!this.validators.uuid(paymentId)) {
      return httpResponse.badRequest(new InvalidParamError("paymentId"));
    }

    const payment = await this.getPaymentUseCase.execute({
      tableSessionId,
      paymentId,
    });

    if (!payment) {
      return httpResponse.notFound("Payment", "Make sure order item exists.");
    }

    const { id, table_session_id, method, amount, status, created_at } =
      payment;

    return httpResponse.ok({
      id,
      tableSessionId: table_session_id,
      method,
      amount,
      status,
      createdAt: created_at,
    });
  }
}
