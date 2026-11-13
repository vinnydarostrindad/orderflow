import GetOpenTableSessionRouter from "../../../presentation/routers/table_session/get-open-table-session-router.js";
import GetOpenTableSessionUseCase from "../../../domain/usecase/table_session/get-open-table-session-usecase.js";
import TableSessionRepository from "../../../infra/repositories/table-session-repository.js";
import validators from "../../../utils/validator.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";

export default {
  execute() {
    const tableSessionRepository = new TableSessionRepository({
      postgresAdapter,
    });
    const getOpenTableSessionUseCase = new GetOpenTableSessionUseCase({
      tableSessionRepository,
    });
    const getOpenTableSessionRouter = new GetOpenTableSessionRouter({
      getOpenTableSessionUseCase,
      validators,
    });

    return getOpenTableSessionRouter;
  },
};
