import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../http-response.js";

export default class RegisterOrderRouter {
  constructor({ registerOrderUseCase, validators } = {}) {
    this.registerOrderUseCase = registerOrderUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { tableNumber } = httpRequest.body;
    const { tableId, businessId } = httpRequest.params;

    if (!businessId) {
      return httpResponse.badRequest(new MissingParamError("businessId"));
    }
    if (!this.validators.uuid(businessId)) {
      return httpResponse.badRequest(new InvalidParamError("businessId"));
    }
    if (!tableId) {
      return httpResponse.badRequest(new MissingParamError("tableId"));
    }
    if (!this.validators.uuid(tableId)) {
      return httpResponse.badRequest(new InvalidParamError("tableId"));
    }
    if (!tableNumber) {
      return httpResponse.badRequest(new MissingParamError("tableNumber"));
    }

    const order = await this.registerOrderUseCase.execute({
      tableId,
      businessId,
      tableNumber,
    });

    return httpResponse.created(order);
  }
}
