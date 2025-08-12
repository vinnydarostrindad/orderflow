import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../http-response.js";

export default class RegisterBusinessRouter {
  constructor({ registerBusinessUseCase, validators } = {}) {
    this.registerBusinessUseCase = registerBusinessUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { name, email, password } = httpRequest.body;

    if (!name) {
      return httpResponse.badRequest(new MissingParamError("name"));
    }
    if (!email) {
      return httpResponse.badRequest(new MissingParamError("email"));
    }
    if (!this.validators.email(email)) {
      return httpResponse.badRequest(new InvalidParamError("email"));
    }
    if (!password) {
      return httpResponse.badRequest(new MissingParamError("password"));
    }

    const business = await this.registerBusinessUseCase.execute({
      name,
      email,
      password,
    });

    return httpResponse.created(business);
  }
}
