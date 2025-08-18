import MissingParamError from "../../../utils/errors/missing-param-error.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import httpResponse from "../../http-response.js";

export default class RegisterTableRouter {
  constructor({ registerTableUseCase, validators } = {}) {
    this.registerTableUseCase = registerTableUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { number, name } = httpRequest.body;
    const { businessId } = httpRequest.auth;

    if (!number) {
      return httpResponse.badRequest(new MissingParamError("number"));
    }
    if (!businessId) {
      return httpResponse.badRequest(new MissingParamError("businessId"));
    }
    if (!this.validators.uuid(businessId)) {
      return httpResponse.badRequest(new InvalidParamError("businessId"));
    }

    const table = await this.registerTableUseCase.execute({
      number,
      name,
      businessId,
    });

    return httpResponse.created(table);
  }
}
