import RegisterEmployeeRouter from "../../../presentation/routers/employee/register-employee-router.js";
import RegisterEmployeeUseCase from "../../../domain/usecase/employee/register-employee-usecase.js";
import AuthUseCase from "../../../domain/usecase/auth-usecase.js";
import validators from "../../../utils/validator.js";
import crypto from "../../../utils/crypto.js";
import idGenerator from "../../../utils/id-generator.js";
import EmployeeRepository from "../../../infra/repositories/employee-repository.js";
import jwt from "../../../utils/jwt.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";

const registerEmployeeRouterComposer = {
  execute() {
    const employeeRepository = new EmployeeRepository({ postgresAdapter });
    const registerEmployeeUseCase = new RegisterEmployeeUseCase({
      crypto,
      idGenerator,
      employeeRepository,
    });
    const authUseCase = new AuthUseCase({ jwt });
    const registerEmployeeRouter = new RegisterEmployeeRouter({
      registerEmployeeUseCase,
      authUseCase,
      validators,
    });
    return registerEmployeeRouter;
  },
};

export default registerEmployeeRouterComposer;
