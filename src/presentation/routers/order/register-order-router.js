import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../httpResponse.js";

export default class RegisterOrderRouter {
  constructor({ registerOrderUseCase } = {}) {
    this.registerOrderUseCase = registerOrderUseCase;
  }

  async route(httpRequest) {
    try {
      const { tableNumber } = httpRequest.body;
      const { tableId, businessId } = httpRequest.params;

      if (!tableId) {
        return httpResponse.badRequest(new MissingParamError("tableId"));
      }
      if (!businessId) {
        return httpResponse.badRequest(new MissingParamError("businessId"));
      }
      if (!tableNumber) {
        return httpResponse.badRequest(new MissingParamError("tableNumber"));
      }

      const order = await this.registerOrderUseCase.execute({
        tableId,
        businessId,
        tableNumber,
      });

      if (!order) {
        // Melhorar esse error depois, se necessário
        return httpResponse.serverError();
      }

      return httpResponse.created(order);
    } catch (err) {
      console.error(err);
      return httpResponse.serverError();
    }
  }
}
