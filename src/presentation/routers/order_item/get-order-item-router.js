import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../http-response.js";

export default class GetOrderItemRouter {
  constructor({ getOrderItemUseCase, validators } = {}) {
    this.getOrderItemUseCase = getOrderItemUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { tableId, orderItemId } = httpRequest.params;
    const { businessId } = httpRequest.auth;
    const { period } = httpRequest.query;

    if (!tableId) {
      if (!businessId) {
        return httpResponse.badRequest(new MissingParamError("businessId"));
      }
      if (!this.validators.uuid(businessId)) {
        return httpResponse.badRequest(new InvalidParamError("businessId"));
      }

      const orderedItems = await this.getOrderItemUseCase.execute(
        {
          businessId,
        },
        period,
      );

      const editedOrderedItems = orderedItems.map(
        ({
          id,
          table_id,
          menu_item_id,
          quantity,
          total_price,
          status,
          notes,
          order_item_created_at,
          order_item_updated_at,
          table_number,
        }) => ({
          id,
          tableId: table_id,
          menuItemId: menu_item_id,
          quantity: quantity.toString(),
          totalPrice: total_price,
          status,
          notes,
          createdAt: order_item_created_at,
          updatedAt: order_item_updated_at,
          tableNumber: table_number,
        }),
      );
      return httpResponse.ok(editedOrderedItems);
    }

    if (!this.validators.uuid(tableId)) {
      return httpResponse.badRequest(new InvalidParamError("tableId"));
    }

    if (!orderItemId) {
      const orderItems = await this.getOrderItemUseCase.execute({ tableId });

      const editedOrderItems = orderItems.map(
        ({
          id,
          menu_item_id,
          table_id,
          quantity,
          unit_price,
          total_price,
          status,
          notes,
          created_at,
          updated_at,
        }) => ({
          id,
          tableId: table_id,
          menuItemId: menu_item_id,
          quantity: quantity.toString(),
          unitPrice: unit_price,
          totalPrice: total_price,
          status,
          notes,
          createdAt: created_at,
          updatedAt: updated_at,
        }),
      );

      return httpResponse.ok(editedOrderItems);
    }

    if (!this.validators.uuid(orderItemId)) {
      return httpResponse.badRequest(new InvalidParamError("orderItemId"));
    }

    const orderItem = await this.getOrderItemUseCase.execute({
      tableId,
      orderItemId,
    });

    if (!orderItem) {
      return httpResponse.notFound("OrderItem", "Make sure order item exists.");
    }

    const {
      id,
      menu_item_id,
      table_id,
      quantity,
      unit_price,
      total_price,
      status,
      notes,
      created_at,
      updated_at,
    } = orderItem;

    return httpResponse.ok({
      id,
      tableId: table_id,
      menuItemId: menu_item_id,
      quantity: quantity.toString(),
      unitPrice: unit_price,
      totalPrice: total_price,
      status,
      notes,
      createdAt: created_at,
      updatedAt: updated_at,
    });
  }
}
