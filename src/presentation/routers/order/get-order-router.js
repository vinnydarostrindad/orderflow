import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../http-response.js";

export default class GetOrderRouter {
  constructor({ getOrderUseCase } = {}) {
    this.getOrderUseCase = getOrderUseCase;
  }

  async route(httpRequest) {
    try {
      const { tableId, orderId } = httpRequest.params;
      if (!tableId) {
        return httpResponse.badRequest(new MissingParamError("tableId"));
      }

      if (!orderId) {
        const orders = await this.getOrderUseCase.execute(tableId);
        if (!orders) {
          return httpResponse.notFound("Order");
        }

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

      const order = await this.getOrderUseCase.execute(tableId, orderId);

      if (!order) {
        return httpResponse.notFound("Order");
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
    } catch (err) {
      console.error(err);
      return httpResponse.serverError();
    }
  }
}
