import MissingParamError from "../../utils/errors/missing-param-error.js";
import httpResponse from "../httpResponse.js";

export default class RegisterEmployeeRouter {
  constructor({ registerEmployeeUseCase, authUseCase } = {}) {
    this.registerEmployeeUseCase = registerEmployeeUseCase;
    this.authUseCase = authUseCase;
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
        // Fazer um erro mais específico depois
        return new Error();
      }

      const token = this.authUseCase.generateToken(employee.id);
      const createdEmployee = {
        employee,
        token,
      };

      return httpResponse.created(createdEmployee);
    } catch (err) {
      console.log(err);
      return httpResponse.serverError();
    }
  }
}
