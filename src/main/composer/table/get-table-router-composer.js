import GetTableRouter from "../../../presentation/routers/table/get-table-router.js";
import GetTableUseCase from "../../../domain/usecase/table/get-table-usecase.js";
import validators from "../../../utils/validator.js";
import TableRepository from "../../../infra/repositories/table-repository.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";

const getTableRouterComposer = {
  execute() {
    const tableRepository = new TableRepository({ postgresAdapter });
    const getTableUseCase = new GetTableUseCase({
      tableRepository,
    });
    const getTableRouter = new GetTableRouter({
      getTableUseCase,
      validators,
    });
    return getTableRouter;
  },
};

export default getTableRouterComposer;
