import GetEmployeeRouter from "../../presentation/routers/get-employee-router.js";
import GetEmployeeUseCase from "../../domain/usecase/get-employee-usecase.js";
import EmployeeRepository from "../../infra/repositories/employee-repository.js";
import postgresAdapter from "../../infra/adaptors/postgres-adapter.js";

const getEmployeeRouterComposer = {
  execute() {
    const employeeRepository = new EmployeeRepository({ postgresAdapter });
    const getEmployeeUseCase = new GetEmployeeUseCase({ employeeRepository });
    const getEmployeeRouter = new GetEmployeeRouter({ getEmployeeUseCase });
    return getEmployeeRouter;
  },
};

export default getEmployeeRouterComposer;
