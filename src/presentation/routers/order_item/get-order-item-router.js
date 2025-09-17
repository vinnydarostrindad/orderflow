import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../http-response.js";

export default class GetOrderItemRouter {
  constructor({ getOrderItemUseCase, validators } = {}) {
    this.getOrderItemUseCase = getOrderItemUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { orderId, orderItemId } = httpRequest.params;
    const { businessId } = httpRequest.auth;
    const { period } = httpRequest.query;

    if (!orderId) {
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
          order_id,
          menu_item_id,
          quantity,
          total_price,
          status,
          order_item_created_at,
          table_number,
        }) => ({
          orderId: order_id,
          menuItemId: menu_item_id,
          quantity: quantity.toString(),
          totalPrice: total_price,
          status,
          createdAt: order_item_created_at,
          tableNumber: table_number,
        }),
      );

      return httpResponse.ok(editedOrderedItems);
    }

    if (!this.validators.uuid(orderId)) {
      return httpResponse.badRequest(new InvalidParamError("orderId"));
    }

    if (!orderItemId) {
      const orderItems = await this.getOrderItemUseCase.execute({ orderId });

      const editedOrderItems = orderItems.map(
        ({
          id,
          menu_item_id,
          quantity,
          unit_price,
          total_price,
          status,
          notes,
          created_at,
          updated_at,
        }) => ({
          id,
          orderId,
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
      orderId,
      orderItemId,
    });

    if (!orderItem) {
      return httpResponse.notFound("OrderItem", "Make sure order item exists.");
    }

    const {
      id,
      menu_item_id,
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
      orderId,
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
