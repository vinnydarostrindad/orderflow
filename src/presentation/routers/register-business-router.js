import InvalidParamError from "../../utils/errors/invalid-param-error.js";
import MissingParamError from "../../utils/errors/missing-param-error.js";
import httpResponse from "../httpResponse.js";

export default class RegisterBusinessRouter {
  constructor({ registerBusinessUseCase, emailValidator } = {}) {
    this.registerBusinessUseCase = registerBusinessUseCase;
    this.emailValidator = emailValidator;
  }

  async route(httpRequest) {
    try {
      const { name, email, password } = httpRequest.body;

      if (!name) {
        return httpResponse.badRequest(new MissingParamError("name"));
      }
      if (!email) {
        return httpResponse.badRequest(new MissingParamError("email"));
      }
      if (!this.emailValidator.execute(email)) {
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
      if (!business) {
        // O Error que irá retornar ainda será definido
        return { statusCode: 400 };
      }
      return httpResponse.created(business);
    } catch (err) {
      console.log(err);
      return httpResponse.serverError();
    }
  }
}
