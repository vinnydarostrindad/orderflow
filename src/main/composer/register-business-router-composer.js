import RegisterBusinessRouter from "../../presentation/routers/register-business-router.js";
import emailValidator from "../../utils/email-validator.js";
import RegisterBusinessUseCase from "../../domain/usecase/register-business-usecase.js";
import crypto from "../../utils/crypto.js";
import idGenerator from "../../utils/id-generator.js";
import BusinessRepository from "../../infra/repositories/business-repository.js";
import postgresAdapter from "../../infra/adaptors/postgres-adapter.js";

const registerBusinessRouterComposer = {
  execute() {
    const businessRepository = new BusinessRepository({ postgresAdapter });
    const registerBusinessUseCase = new RegisterBusinessUseCase({
      crypto,
      idGenerator,
      businessRepository,
    });
    const registerBusinessRouter = new RegisterBusinessRouter({
      emailValidator,
      registerBusinessUseCase,
    });
    return registerBusinessRouter;
  },
};

export default registerBusinessRouterComposer;
