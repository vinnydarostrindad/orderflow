import MissingParamError from "../../../utils/errors/missing-param-error.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import httpResponse from "../../http-response.js";

export default class RegisterPaymentsRouter {
  constructor({ registerPaymentsUseCase, validators } = {}) {
    this.registerPaymentsUseCase = registerPaymentsUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { tableSessionId } = httpRequest.params;
    const { method, amount } = httpRequest.body;

    if (!tableSessionId) {
      return httpResponse.badRequest(new MissingParamError("tableSessionId"));
    }
    if (!this.validators.uuid(tableSessionId)) {
      return httpResponse.badRequest(new InvalidParamError("tableSessionId"));
    }
    if (!method) {
      return httpResponse.badRequest(new MissingParamError("method"));
    }
    if (!amount) {
      return httpResponse.badRequest(new MissingParamError("amount"));
    }

    const payment = await this.registerPaymentsUseCase.execute({
      tableSessionId,
      method,
      amount,
    });

    return httpResponse.created({
      id: payment.id,
      tableSessionId: payment.table_session_id,
      method: payment.method,
      amount: payment.amount,
      status: payment.status,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
    });
  }
}
