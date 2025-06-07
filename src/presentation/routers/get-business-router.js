import MissingParamError from "../../utils/errors/missing-param-error.js";
import httpResponse from "../httpResponse.js";

export default class GetBusinessRouter {
  constructor({ getBusinessUseCase } = {}) {
    this.getBusinessUseCase = getBusinessUseCase;
  }

  async route(httpRequest) {
    try {
      const { business_id } = httpRequest.params;
      if (!business_id) {
        return httpResponse.badRequest(new MissingParamError("business_id"));
      }

      const business = await this.getBusinessUseCase.execute(business_id);

      if (!business) {
        return httpResponse.notFound("Business");
      }

      const { name, email, created_at, updated_at } = business;

      return httpResponse.ok({
        id: business_id,
        name,
        email,
        created_at,
        updated_at,
      });
    } catch (err) {
      console.error(err);
      return httpResponse.serverError();
    }
  }
}
