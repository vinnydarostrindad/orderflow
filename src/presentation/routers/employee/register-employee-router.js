import MissingParamError from "../../../utils/errors/missing-param-error.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import httpResponse from "../../http-response.js";

export default class RegisterEmployeeRouter {
  constructor({ registerEmployeeUseCase, validators } = {}) {
    this.registerEmployeeUseCase = registerEmployeeUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { name, role, password } = httpRequest.body;
    const { businessId } = httpRequest.params;
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
    if (!password) {
      return httpResponse.badRequest(new MissingParamError("password"));
    }

    const employee = await this.registerEmployeeUseCase.execute({
      businessId,
      name,
      role,
      password,
    });

    return httpResponse.created(employee);
  }
}
