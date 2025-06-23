import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class GetEmployeeUseCase {
  constructor({ employeeRepository } = {}) {
    this.employeeRepository = employeeRepository;
  }

  async execute(businessId, employeeId) {
    if (!businessId) throw new MissingParamError("businessId");

    if (!employeeId) {
      const employees = await this.employeeRepository.findAll(businessId);

      return employees;
    }

    const employee = await this.employeeRepository.findById(
      businessId,
      employeeId,
    );

    return employee;
  }
}
