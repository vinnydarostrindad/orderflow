import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../httpResponse.js";

export default class GetOrderItemRouter {
  constructor({ getOrderItemUseCase } = {}) {
    this.getOrderItemUseCase = getOrderItemUseCase;
  }

  async route(httpRequest) {
    try {
      const { orderId, orderItemId } = httpRequest.params;

      if (!orderId) {
        return httpResponse.badRequest(new MissingParamError("orderId"));
      }

      if (!orderItemId) {
        const orderItems = await this.getOrderItemUseCase.execute(orderId);
        if (!orderItems) {
          return httpResponse.notFound("OrderItem");
        }

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

      const orderItem = await this.getOrderItemUseCase.execute(
        orderId,
        orderItemId,
      );

      if (!orderItem) {
        return httpResponse.notFound("OrderItem");
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
    } catch (err) {
      console.error(err);
      return httpResponse.serverError();
    }
  }
}
