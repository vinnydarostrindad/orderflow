import OpenTableSessionRouter from "../../../presentation/routers/table_session/open-table-session-router.js";
import RegisterTableSessionUseCase from "../../../domain/usecase/table_session/register-table-session-usecase.js";
import TableSessionRepository from "../../../infra/repositories/table-session-repository.js";
import validators from "../../../utils/validator.js";
import idGenerator from "../../../utils/id-generator.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";

export default {
  execute() {
    const tableSessionRepository = new TableSessionRepository({
      postgresAdapter,
    });
    const registerTableSessionUseCase = new RegisterTableSessionUseCase({
      idGenerator,
      tableSessionRepository,
    });
    const openTableSessionRouter = new OpenTableSessionRouter({
      registerTableSessionUseCase,
      validators,
    });

    return openTableSessionRouter;
  },
};
