import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../http-response.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";

export default class GetBusinessRouter {
  constructor({ getBusinessUseCase, validators } = {}) {
    this.getBusinessUseCase = getBusinessUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { businessId } = httpRequest.auth;
    if (!businessId) {
      return httpResponse.badRequest(new MissingParamError("businessId"));
    }
    if (!this.validators.uuid(businessId)) {
      return httpResponse.badRequest(new InvalidParamError("businessId"));
    }

    const business = await this.getBusinessUseCase.execute(businessId);

    if (!business) {
      return httpResponse.notFound(
        "Business",
        "Make sure the business exists.",
      );
    }

    const { name, email, created_at, updated_at } = business;

    return httpResponse.ok({
      id: businessId,
      name,
      email,
      createdAt: created_at,
      updatedAt: updated_at,
    });
  }
}
