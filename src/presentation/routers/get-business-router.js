import MissingParamError from "../../utils/errors/missing-param-error.js";
import httpResponse from "../httpResponse.js";

export default class GetBusinessRouter {
  constructor({ getBusinessUseCase } = {}) {
    this.getBusinessUseCase = getBusinessUseCase;
  }

  async route(httpRequest) {
    try {
      const { id } = httpRequest.body;

      if (!id) {
        return httpResponse.badRequest(new MissingParamError("id"));
      }

      const business = await this.getBusinessUseCase.execute(id);

      if (!business) {
        return httpResponse.notFound("Business");
      }

      const { name, email, created_at, updated_at } = business;

      return httpResponse.ok({
        id,
        name,
        email,
        created_at,
        updated_at,
      });
    } catch {
      return httpResponse.serverError();
    }
  }
}
