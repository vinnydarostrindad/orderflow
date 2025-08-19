import LoginEmployeeRouter from "../../../presentation/routers/employee/login-employee-router.js";
import validators from "../../../utils/validator.js";
import LoginEmployeeUseCase from "../../../domain/usecase/employee/login-employee-usecase.js";
import EmployeeRepository from "../../../infra/repositories/employee-repository.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";
import AuthUseCase from "../../../domain/usecase/auth-usecase.js";
import jsonWebToken from "../../../utils/jwt.js";

export default {
  execute() {
    const authUseCase = new AuthUseCase({ jwt: jsonWebToken });
    const employeeRepository = new EmployeeRepository({ postgresAdapter });
    const loginEmployeeUseCase = new LoginEmployeeUseCase({
      employeeRepository,
      authUseCase,
    });
    const loginEmployeeRouter = new LoginEmployeeRouter({
      loginEmployeeUseCase,
      validators,
    });
    return loginEmployeeRouter;
  },
};
