import GetBusinessRouter from "../../presentation/routers/get-business-router.js";
import GetBusinessUseCase from "../../domain/usecase/get-business-usecase.js";
import BusinessRepository from "../../infra/repositories/business-repository.js";
import postgresAdapter from "../../infra/adaptors/postgres-adapter.js";

const getBusinessRouterComposer = {
  execute() {
    const businessRepository = new BusinessRepository({ postgresAdapter });
    const getBusinessUseCase = new GetBusinessUseCase({ businessRepository });
    const getBusinessRouter = new GetBusinessRouter({ getBusinessUseCase });
    return getBusinessRouter;
  },
};

export default getBusinessRouterComposer;
