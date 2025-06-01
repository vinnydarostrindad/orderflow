import MissingParamError from "../../utils/errors/missing-param-error.js";
import httpResponse from "../httpResponse.js";

export default class RegisterEmployeeRouter {
  constructor({ registerEmployeeUseCase } = {}) {
    this.registerEmployeeUseCase = registerEmployeeUseCase;
  }

  async route(httpRequest) {
    try {
      const { business_id, name, role, password } = httpRequest.body;
      if (!business_id) {
        return httpResponse.badRequest(new MissingParamError("business_id"));
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
        business_id,
        name,
        role,
        password,
      });
      if (!employee) {
        // Fazer um erro personalizado
        return httpResponse.serverError();
      }
      return httpResponse.created(employee);
    } catch (err) {
      console.log(err);
      return httpResponse.serverError();
    }
  }
}
