import MissingParamError from "../../utils/errors/missing-param-error";

export default class RegisterEmployeeUseCase {
  constructor({ crypto, idGenerator, employeeRepository } = {}) {
    this.crypto = crypto;
    this.idGenerator = idGenerator;
    this.employeeRepository = employeeRepository;
  }

  async execute({ business_id, name, role, password } = {}) {
    if (!business_id) {
      throw new MissingParamError("business_id");
    }
    if (!name) {
      throw new MissingParamError("name");
    }
    if (!role) {
      throw new MissingParamError("role");
    }
    if (!password) {
      throw new MissingParamError("password");
    }
    const hashedPassword = await this.crypto.hash(password);
    if (!hashedPassword) {
      // Fazer um erro mais específico depois
      return null;
    }
    const id = this.idGenerator.execute();
    if (!id) {
      // Fazer um erro mais específico depois
      return null;
    }
    const employee = await this.employeeRepository.create({
      id,
      business_id,
      name,
      role,
      hashedPassword,
    });
    if (!employee) {
      // Fazer um erro mais específico depois
      return null;
    }
    return employee;
  }
}

// import Employee from "../entities/employee.js";
// import employeeRepository from "../../infra/repositories/employee-repository.js";

// async function registerEmployeeUseCase(businessId, name, password, role) {
//   const employee = await Employee.create(businessId, name, password, role);

//   const results = employeeRepository(employee);

//   return results;
// }

// export default registerEmployeeUseCase;
