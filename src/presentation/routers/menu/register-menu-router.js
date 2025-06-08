import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../httpResponse.js";

export default class RegisterMenuRouter {
  constructor({ registerMenuUseCase } = {}) {
    this.registerMenuUseCase = registerMenuUseCase;
  }

  async route(httpRequest) {
    try {
      const { name } = httpRequest.body;
      const { business_id } = httpRequest.params;

      if (!name) {
        return httpResponse.badRequest(new MissingParamError("name"));
      }
      if (!business_id) {
        return httpResponse.badRequest(new MissingParamError("business_id"));
      }

      const menu = await this.registerMenuUseCase.execute({
        name,
        business_id,
      });
      if (!menu) {
        // Melhorar esse error
        return httpResponse.notFound("Menu");
      }

      return httpResponse.created(menu);
    } catch (err) {
      console.error(err);
      return httpResponse.serverError();
    }
  }
}
