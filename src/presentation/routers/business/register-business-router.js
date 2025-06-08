import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../httpResponse.js";

export default class RegisterBusinessRouter {
  constructor({ registerBusinessUseCase, emailValidator, authUseCase } = {}) {
    this.registerBusinessUseCase = registerBusinessUseCase;
    this.emailValidator = emailValidator;
    this.authUseCase = authUseCase;
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
        // Fazer um erro mais específico depois
        return new Error();
      }

      const token = this.authUseCase.generateToken(business.id);
      const createdBusiness = {
        business,
        token,
      };

      return httpResponse.created(createdBusiness);
    } catch (err) {
      console.error(err);
      return httpResponse.serverError();
    }
  }
}
