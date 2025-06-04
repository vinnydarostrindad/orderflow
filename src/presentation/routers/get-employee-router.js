import MissingParamError from "../../utils/errors/missing-param-error.js";
import httpResponse from "../httpResponse.js";

export default class GetEmployeeRouter {
  constructor({ getEmployeeUseCase } = {}) {
    this.getEmployeeUseCase = getEmployeeUseCase;
  }

  async route(httpRequest) {
    try {
      const { business_id, employee_id } = httpRequest.body;

      if (!business_id) {
        return httpResponse.badRequest(new MissingParamError("business_id"));
      }

      if (!employee_id) {
        const employees = await this.getEmployeeUseCase.execute(business_id);
        if (!employees) {
          return httpResponse.notFound("Employee");
        }

        return httpResponse.ok(employees);
      }

      const employee = await this.getEmployeeUseCase.execute(
        business_id,
        employee_id,
      );

      if (!employee) {
        return httpResponse.notFound("Employee");
      }

      const { name, role, created_at, updated_at } = employee;

      return httpResponse.ok({
        business_id,
        id: employee_id,
        name,
        role,
        created_at,
        updated_at,
      });
    } catch {
      return httpResponse.serverError();
    }
  }
}
