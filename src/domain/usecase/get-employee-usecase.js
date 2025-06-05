import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class GetEmployeeUseCase {
  constructor({ employeeRepository } = {}) {
    this.employeeRepository = employeeRepository;
  }

  async execute(business_id, employee_id) {
    if (!business_id) {
      throw new MissingParamError("business_id");
    }

    if (!employee_id) {
      const employees = await this.employeeRepository.findAll(business_id);
      if (!employees) {
        return null;
      }

      return employees;
    }

    const employee = await this.employeeRepository.findById(
      business_id,
      employee_id,
    );
    if (!employee) {
      // Fazer um erro mais específico depois
      return null;
    }
    return employee;
  }
}
