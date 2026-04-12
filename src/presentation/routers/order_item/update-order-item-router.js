import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../http-response.js";

class UpdateOrderItemRouter {
  constructor({ updateOrderItemUseCase, validators } = {}) {
    this.updateOrderItemUseCase = updateOrderItemUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { businessId } = httpRequest.auth;
    const { orderItemId } = httpRequest.params;
    const { status, quantity, notes } = httpRequest.body;

    if (!businessId) {
      return httpResponse.badRequest(new MissingParamError("businessId"));
    }
    if (!this.validators.uuid(businessId)) {
      return httpResponse.badRequest(new InvalidParamError("businessId"));
    }
    if (!orderItemId) {
      return httpResponse.badRequest(new MissingParamError("orderItemId"));
    }
    if (!this.validators.uuid(orderItemId)) {
      return httpResponse.badRequest(new InvalidParamError("orderItemId"));
    }

    const updatedOrderItem = await this.updateOrderItemUseCase.execute({
      businessId,
      orderItemId,
      status,
      quantity,
      notes,
    });

    return httpResponse.ok({
      id: updatedOrderItem.id,
      tableId: updatedOrderItem.table_id,
      businessId: updatedOrderItem.business_id,
      menuItemId: updatedOrderItem.menu_item_id,
      quantity: updatedOrderItem.quantity.toString(),
      unitPrice: updatedOrderItem.unit_price,
      totalPrice: updatedOrderItem.total_price,
      status: updatedOrderItem.status,
      notes: updatedOrderItem.notes,
      createdAt: updatedOrderItem.created_at,
      updatedAt: updatedOrderItem.updated_at,
    });
  }
}

export default UpdateOrderItemRouter;
