import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../httpResponse.js";

export default class RegisterMenuRouter {
  constructor({ registerMenuUseCase } = {}) {
    this.registerMenuUseCase = registerMenuUseCase;
  }

  async route(httpRequest) {
    try {
      const { name } = httpRequest.body;
      const { businessId } = httpRequest.params;

      if (!name) {
        return httpResponse.badRequest(new MissingParamError("name"));
      }
      if (!businessId) {
        return httpResponse.badRequest(new MissingParamError("businessId"));
      }

      const menu = await this.registerMenuUseCase.execute({
        name,
        businessId,
      });
      if (!menu) {
        // Melhorar esse error
        return httpResponse.serverError();
      }

      return httpResponse.created(menu);
    } catch (err) {
      console.error(err);
      return httpResponse.serverError();
    }
  }
}
