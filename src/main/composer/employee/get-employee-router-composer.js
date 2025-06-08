import GetEmployeeRouter from "../../../presentation/routers/employee/get-employee-router.js";
import GetEmployeeUseCase from "../../../domain/usecase/employee/get-employee-usecase.js";
import EmployeeRepository from "../../../infra/repositories/employee-repository.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";

const getEmployeeRouterComposer = {
  execute() {
    const employeeRepository = new EmployeeRepository({ postgresAdapter });
    const getEmployeeUseCase = new GetEmployeeUseCase({ employeeRepository });
    const getEmployeeRouter = new GetEmployeeRouter({ getEmployeeUseCase });
    return getEmployeeRouter;
  },
};

export default getEmployeeRouterComposer;
