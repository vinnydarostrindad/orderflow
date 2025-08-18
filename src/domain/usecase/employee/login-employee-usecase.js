import MissingParamError from "../../../utils/errors/missing-param-error.js";
import InvalidCredentialsError from "../../../utils/errors/invalid-credentials-error.js";

class LoginEmployeeUsecase {
  constructor({ employeeRepository, authUseCase } = {}) {
    this.employeeRepository = employeeRepository;
    this.authUseCase = authUseCase;
  }

  async execute({ name, role, businessId } = {}) {
    if (!businessId) throw new MissingParamError("businessId");
    if (!name) throw new MissingParamError("name");
    if (!role) throw new MissingParamError("role");

    const employee = await this.employeeRepository.findByNameAndRole(
      businessId,
      name,
      role,
    );
    if (!employee) {
      throw new InvalidCredentialsError();
    }

    const token = this.authUseCase.generateToken({
      employeeId: employee.id,
      businessId,
      role,
    });
    if (!token) return null;

    return token;
  }
}

export default LoginEmployeeUsecase;
