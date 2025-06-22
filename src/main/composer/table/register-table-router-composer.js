import RegisterTableRouter from "../../../presentation/routers/table/register-table-router.js";
import RegisterTableUseCase from "../../../domain/usecase/table/register-table-usecase.js";
import validators from "../../../utils/validator.js";
import TableRepository from "../../../infra/repositories/table-repository.js";
import idGenerator from "../../../utils/id-generator.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";

const registerTableRouterComposer = {
  execute() {
    const tableRepository = new TableRepository({ postgresAdapter });
    const registerTableUseCase = new RegisterTableUseCase({
      idGenerator,
      tableRepository,
    });
    const registerTableRouter = new RegisterTableRouter({
      registerTableUseCase,
      validators,
    });
    return registerTableRouter;
  },
};

export default registerTableRouterComposer;
