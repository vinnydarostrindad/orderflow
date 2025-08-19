import MissingParamError from "../../../utils/errors/missing-param-error.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import httpResponse from "../../http-response.js";

export default class RegisterMenuRouter {
  constructor({ registerMenuUseCase, validators } = {}) {
    this.registerMenuUseCase = registerMenuUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { name } = httpRequest.body;
    const { businessId } = httpRequest.auth;

    if (!name) {
      return httpResponse.badRequest(new MissingParamError("name"));
    }
    if (!businessId) {
      return httpResponse.badRequest(new MissingParamError("businessId"));
    }
    if (!this.validators.uuid(businessId)) {
      return httpResponse.badRequest(new InvalidParamError("businessId"));
    }

    const menu = await this.registerMenuUseCase.execute({
      name,
      businessId,
    });

    return httpResponse.created(menu);
  }
}
