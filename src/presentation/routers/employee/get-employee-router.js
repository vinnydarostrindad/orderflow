import MissingParamError from "../../../utils/errors/missing-param-error.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import httpResponse from "../../http-response.js";

export default class GetEmployeeRouter {
  constructor({ getEmployeeUseCase, validators } = {}) {
    this.getEmployeeUseCase = getEmployeeUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { businessId, employeeId } = httpRequest.params;

    if (!businessId) {
      return httpResponse.badRequest(new MissingParamError("businessId"));
    }

    if (!this.validators.uuid(businessId)) {
      return httpResponse.badRequest(new InvalidParamError("businessId"));
    }

    if (!employeeId) {
      const employees = await this.getEmployeeUseCase.execute(businessId);

      const editedEmployees = employees.map(
        ({ id, name, role, created_at, updated_at }) => ({
          id,
          businessId,
          name,
          role,
          createdAt: created_at,
          updatedAt: updated_at,
        }),
      );

      return httpResponse.ok(editedEmployees);
    }

    console.log(this.validators.uuid);
    if (!this.validators.uuid(employeeId)) {
      return httpResponse.badRequest(new InvalidParamError("employeeId"));
    }

    const employee = await this.getEmployeeUseCase.execute(
      businessId,
      employeeId,
    );

    if (!employee) {
      return httpResponse.notFound("Employee", "Make sure the employee exists");
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
  }
}
