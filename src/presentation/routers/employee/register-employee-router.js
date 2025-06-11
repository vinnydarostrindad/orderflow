import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../httpResponse.js";

export default class RegisterEmployeeRouter {
  constructor({ registerEmployeeUseCase, authUseCase } = {}) {
    this.registerEmployeeUseCase = registerEmployeeUseCase;
    this.authUseCase = authUseCase;
  }

  async route(httpRequest) {
    try {
      const { name, role, password } = httpRequest.body;
      const { businessId } = httpRequest.params;
      if (!businessId) {
        return httpResponse.badRequest(new MissingParamError("businessId"));
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
      console.error(err);
      return httpResponse.serverError();
    }
  }
}
