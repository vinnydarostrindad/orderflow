import Employee from "../entities/employee.js";
import employeeRepository from "../infra/repositories/employeeRepository.js";

async function registerEmployeeUseCase(businessId, name, password, role) {
  const employee = await Employee.create(businessId, name, password, role);

  const results = employeeRepository(employee);

  return results;
}

export default registerEmployeeUseCase;
