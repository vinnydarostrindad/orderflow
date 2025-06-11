import Employee from "../../entities/employee.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

export default class RegisterEmployeeUseCase {
  constructor({ crypto, idGenerator, employeeRepository } = {}) {
    this.crypto = crypto;
    this.idGenerator = idGenerator;
    this.employeeRepository = employeeRepository;
  }

  async execute({ businessId, name, role, password } = {}) {
    if (!businessId) {
      throw new MissingParamError("businessId");
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

    const employee = new Employee({
      id,
      businessId,
      name,
      hashedPassword,
      role,
    });

    const result = await this.employeeRepository.create(employee);
    if (!result) {
      // Fazer um erro mais específico depois
      return null;
    }
    return result;
  }
}
