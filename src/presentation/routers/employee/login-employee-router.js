import httpResponse from "../../http-response.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";

class LoginEmployeeRouter {
  constructor({ loginEmployeeUseCase, validators } = {}) {
    this.loginEmployeeUseCase = loginEmployeeUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { name, role, businessId } = httpRequest.body;
    if (!businessId) {
      return httpResponse.badRequest(new MissingParamError("businessId"));
    }
    if (!this.validators.uuid(businessId)) {
      return httpResponse.badRequest(new InvalidParamError("businessId"));
    }
    if (!name) {
      return httpResponse.badRequest(new MissingParamError("name"));
    }
    if (!role) {
      return httpResponse.badRequest(new MissingParamError("role"));
    }

    const token = await this.loginEmployeeUseCase.execute({
      name,
      role,
      businessId,
    });

    return httpResponse.ok(token, {
      "Set-Cookie": `token=${token}; path=/; max-age=57600`,
    });
  }
}

export default LoginEmployeeRouter;
