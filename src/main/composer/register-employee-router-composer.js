import RegisterEmployeeRouter from "../../presentation/routers/register-employee-router.js";
import RegisterEmployeeUseCase from "../../domain/usecase/register-employee-usecase.js";
import crypto from "../../utils/crypto.js";
import idGenerator from "../../utils/id-generator.js";
import EmployeeRepository from "../../infra/repositories/employee-repository.js";
import postgresAdapter from "../../infra/adaptors/postgres-adapter.js";

const registerEmployeeRouterComposer = {
  execute() {
    const employeeRepository = new EmployeeRepository({ postgresAdapter });
    const registerEmployeeUseCase = new RegisterEmployeeUseCase({
      crypto,
      idGenerator,
      employeeRepository,
    });
    const registerEmployeeRouter = new RegisterEmployeeRouter({
      registerEmployeeUseCase,
    });
    return registerEmployeeRouter;
  },
};

export default registerEmployeeRouterComposer;
