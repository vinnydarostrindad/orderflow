import CloseTableSessionRouter from "../../../presentation/routers/table_session/close-table-session-router.js";
import CloseTableSessionUseCase from "../../../domain/usecase/table_session/close-table-session-usecase.js";
import TableSessionRepository from "../../../infra/repositories/table-session-repository.js";
import validators from "../../../utils/validator.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";

export default {
  execute() {
    const tableSessionRepository = new TableSessionRepository({
      postgresAdapter,
    });
    const closeTableSessionUseCase = new CloseTableSessionUseCase({
      tableSessionRepository,
    });
    const closeTableSessionRouter = new CloseTableSessionRouter({
      closeTableSessionUseCase,
      validators,
    });

    return closeTableSessionRouter;
  },
};
