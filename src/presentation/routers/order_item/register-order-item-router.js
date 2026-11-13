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
    const { tableSessionId } = httpRequest.params;

    if (!tableSessionId) {
      return httpResponse.badRequest(new MissingParamError("tableSessionId"));
    }
    if (!this.validators.uuid(tableSessionId)) {
      return httpResponse.badRequest(new InvalidParamError("tableSessionId"));
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
      tableSessionId,
      menuItemId,
      quantity,
      unitPrice,
      totalPrice,
      notes,
    });

    return httpResponse.created({
      id: orderItem.id,
      tableSessionId: orderItem.table_session_id,
      businessId: orderItem.business_id,
      menuItemId: orderItem.menu_item_id,
      quantity: orderItem.quantity.toString(),
      unitPrice: orderItem.unit_price,
      totalPrice: orderItem.total_price,
      status: orderItem.status,
      notes: orderItem.notes,
      createdAt: orderItem.created_at,
      updatedAt: orderItem.updated_at,
    });
  }
}
