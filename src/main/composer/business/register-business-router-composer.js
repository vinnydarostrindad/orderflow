import RegisterBusinessRouter from "../../../presentation/routers/business/register-business-router.js";
import validators from "../../../utils/validator.js";
import RegisterBusinessUseCase from "../../../domain/usecase/business/register-business-usecase.js";
import crypto from "../../../utils/crypto.js";
import idGenerator from "../../../utils/id-generator.js";
import BusinessRepository from "../../../infra/repositories/business-repository.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";

const registerBusinessRouterComposer = {
  execute() {
    const businessRepository = new BusinessRepository({ postgresAdapter });
    const registerBusinessUseCase = new RegisterBusinessUseCase({
      crypto,
      idGenerator,
      businessRepository,
    });
    const registerBusinessRouter = new RegisterBusinessRouter({
      validators,
      registerBusinessUseCase,
    });
    return registerBusinessRouter;
  },
};

export default registerBusinessRouterComposer;
