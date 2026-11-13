import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../http-response.js";

export default class DeletePaymentRouter {
  constructor({ deletePaymentUseCase, validators } = {}) {
    this.deletePaymentUseCase = deletePaymentUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { tableSessionId, paymentId } = httpRequest.params;

    if (!tableSessionId) {
      return httpResponse.badRequest(new MissingParamError("tableSessionId"));
    }
    if (!this.validators.uuid(tableSessionId)) {
      return httpResponse.badRequest(new InvalidParamError("tableSessionId"));
    }
    if (!paymentId) {
      return httpResponse.badRequest(new MissingParamError("paymentId"));
    }
    if (!this.validators.uuid(paymentId)) {
      return httpResponse.badRequest(new InvalidParamError("paymentId"));
    }

    const payment = await this.deletePaymentUseCase.execute({
      tableSessionId,
      paymentId,
    });

    if (!payment) {
      return httpResponse.notFound("Payment", "Make sure payment exists.");
    }

    return httpResponse.ok({ id: payment.id });
  }
}
