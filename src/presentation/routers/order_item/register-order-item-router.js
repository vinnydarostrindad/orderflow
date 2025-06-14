import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../httpResponse.js";

export default class RegisterOrderItemRouter {
  constructor({ registerOrderItemUseCase } = {}) {
    this.registerOrderItemUseCase = registerOrderItemUseCase;
  }

  async route(httpRequest) {
    try {
      const { menuItemId, quantity, unitPrice, totalPrice, notes } =
        httpRequest.body;
      const { orderId } = httpRequest.params;

      if (!orderId) {
        return httpResponse.badRequest(new MissingParamError("orderId"));
      }
      if (!menuItemId) {
        return httpResponse.badRequest(new MissingParamError("menuItemId"));
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
        orderId,
        menuItemId,
        quantity,
        unitPrice,
        totalPrice,
        notes,
      });

      if (!orderItem) {
        // Melhorar esse erro futuramente
        return httpResponse.serverError();
      }

      return httpResponse.created(orderItem);
    } catch (err) {
      console.error(err);
      return httpResponse.serverError();
    }
  }
}
