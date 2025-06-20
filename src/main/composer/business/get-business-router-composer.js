import GetBusinessRouter from "../../../presentation/routers/business/get-business-router.js";
import validators from "../../../utils/validator.js";
import GetBusinessUseCase from "../../../domain/usecase/business/get-business-usecase.js";
import BusinessRepository from "../../../infra/repositories/business-repository.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";

const getBusinessRouterComposer = {
  execute() {
    const businessRepository = new BusinessRepository({ postgresAdapter });
    const getBusinessUseCase = new GetBusinessUseCase({ businessRepository });
    const getBusinessRouter = new GetBusinessRouter({
      getBusinessUseCase,
      validators,
    });
    return getBusinessRouter;
  },
};

export default getBusinessRouterComposer;
