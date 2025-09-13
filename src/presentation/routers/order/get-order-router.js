import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import httpResponse from "../../http-response.js";

export default class GetOrderRouter {
  constructor({ getOrderUseCase, validators } = {}) {
    this.getOrderUseCase = getOrderUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { tableId, orderId } = httpRequest.params;
    const { businessId } = httpRequest.auth;

    if (!tableId) {
      const order = await this.getOrderUseCase.execute({
        businessId,
        orderId,
      });
      const { id, business_id, table_number, status, created_at, updated_at } =
        order;

      return httpResponse.ok({
        id,
        businessId: business_id,
        tableId,
        tableNumber: table_number.toString(),
        status,
        createdAt: created_at,
        updatedAt: updated_at,
      });
    }
    if (!this.validators.uuid(tableId)) {
      return httpResponse.badRequest(new InvalidParamError("tableId"));
    }

    if (!orderId) {
      const orders = await this.getOrderUseCase.execute({ tableId });

      const editedOrders = orders.map(
        ({
          id,
          business_id,
          table_number,
          status,
          created_at,
          updated_at,
        }) => ({
          id,
          businessId: business_id,
          tableId,
          tableNumber: table_number.toString(),
          status,
          createdAt: created_at,
          updatedAt: updated_at,
        }),
      );

      return httpResponse.ok(editedOrders);
    }

    if (!this.validators.uuid(orderId)) {
      return httpResponse.badRequest(new InvalidParamError("orderId"));
    }

    const order = await this.getOrderUseCase.execute({ tableId, orderId });

    if (!order) {
      return httpResponse.notFound("Order", "Make sure order exists.");
    }

    const { id, business_id, table_number, status, created_at, updated_at } =
      order;

    return httpResponse.ok({
      id,
      businessId: business_id,
      tableId,
      tableNumber: table_number.toString(),
      status,
      createdAt: created_at,
      updatedAt: updated_at,
    });
  }
}
