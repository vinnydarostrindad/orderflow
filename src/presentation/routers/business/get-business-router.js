import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../httpResponse.js";

export default class GetBusinessRouter {
  constructor({ getBusinessUseCase } = {}) {
    this.getBusinessUseCase = getBusinessUseCase;
  }

  async route(httpRequest) {
    try {
      const { businessId } = httpRequest.params;
      if (!businessId) {
        return httpResponse.badRequest(new MissingParamError("businessId"));
      }

      const business = await this.getBusinessUseCase.execute(businessId);

      if (!business) {
        return httpResponse.notFound("Business");
      }

      const { name, email, createdAt, updatedAt } = business;

      return httpResponse.ok({
        id: businessId,
        name,
        email,
        createdAt,
        updatedAt,
      });
    } catch (err) {
      console.error(err);
      return httpResponse.serverError();
    }
  }
}
