import MissingParamError from "../../../utils/errors/missing-param-error.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import httpResponse from "../../http-response.js";

export default class RegisterOrderItemRouter {
  constructor({ registerOrderItemUseCase, validators } = {}) {
    this.registerOrderItemUseCase = registerOrderItemUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { menuItemId, quantity, unitPrice, totalPrice, notes } =
      httpRequest.body;
    const { tableId } = httpRequest.params;

    if (!tableId) {
      return httpResponse.badRequest(new MissingParamError("tableId"));
    }
    if (!this.validators.uuid(tableId)) {
      return httpResponse.badRequest(new InvalidParamError("tableId"));
    }
    if (!menuItemId) {
      return httpResponse.badRequest(new MissingParamError("menuItemId"));
    }
    if (!this.validators.uuid(menuItemId)) {
      return httpResponse.badRequest(new InvalidParamError("menuItemId"));
    }
    if (!quantity) {
      return httpResponse.badRequest(new MissingParamError("quantity"));
    }
    if (!unitPrice) {
      return httpResponse.badRequest(new MissingParamError("unitPrice"));
    }
    if (!totalPrice) {
      return httpResponse.badRequest(new MissingParamError("totalPrice"));
    }

    const orderItem = await this.registerOrderItemUseCase.execute({
      tableId,
      menuItemId,
      quantity,
      unitPrice,
      totalPrice,
      notes,
    });

    return httpResponse.created(orderItem);
  }
}
