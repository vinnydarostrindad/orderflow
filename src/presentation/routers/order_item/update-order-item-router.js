import InvalidParamError from "../../../utils/errors/invalid-param-error";
import MissingParamError from "../../../utils/errors/missing-param-error";
import httpResponse from "../../http-response";

class UpdateOrderItemRouter {
  constructor({ updateOrderItemUseCase, validators } = {}) {
    this.updateOrderItemUseCase = updateOrderItemUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { businessId } = httpRequest.auth;
    const { orderItemId } = httpRequest.params;
    const newOrderItemValues = httpRequest.body;

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

    const updatedOrderItem = await this.updateOrderItemUseCase.execute(
      businessId,
      newOrderItemValues,
    );
    return httpResponse.ok(updatedOrderItem);
  }
}

export default UpdateOrderItemRouter;
