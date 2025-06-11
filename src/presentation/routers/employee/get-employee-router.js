import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../httpResponse.js";

export default class GetEmployeeRouter {
  constructor({ getEmployeeUseCase } = {}) {
    this.getEmployeeUseCase = getEmployeeUseCase;
  }

  async route(httpRequest) {
    try {
      const { businessId, employeeId } = httpRequest.params;

      if (!businessId) {
        return httpResponse.badRequest(new MissingParamError("businessId"));
      }

      if (!employeeId) {
        const employees = await this.getEmployeeUseCase.execute(businessId);
        if (!employees) {
          return httpResponse.notFound("Employee");
        }

        employees.forEach((employee) => {
          const { created_at, updated_at } = employee;

          delete employee?.password;
          delete employee?.created_at;
          delete employee?.updated_at;
          delete employee?.business_id;

          employee.createdAt = created_at;
          employee.updatedAt = updated_at;
          employee.businessId = businessId;
        });

        return httpResponse.ok(employees);
      }

      const employee = await this.getEmployeeUseCase.execute(
        businessId,
        employeeId,
      );

      if (!employee) {
        return httpResponse.notFound("Employee");
      }

      const { name, role, created_at, updated_at } = employee;

      return httpResponse.ok({
        businessId,
        id: employeeId,
        name,
        role,
        createdAt: created_at,
        updatedAt: updated_at,
      });
    } catch (err) {
      console.error(err);
      return httpResponse.serverError();
    }
  }
}
