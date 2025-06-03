import RegisterBusinessRouter from "../../presentation/routers/register-business-router.js";
import emailValidator from "../../utils/email-validator.js";
import RegisterBusinessUseCase from "../../domain/usecase/register-business-usecase.js";
import AuthUseCase from "../../domain/usecase/auth-usecase.js";
import crypto from "../../utils/crypto.js";
import idGenerator from "../../utils/id-generator.js";
import BusinessRepository from "../../infra/repositories/business-repository.js";
import jwt from "../../utils/jwt.js";
import postgresAdapter from "../../infra/adaptors/postgres-adapter.js";

const registerBusinessRouterComposer = {
  execute() {
    const businessRepository = new BusinessRepository({ postgresAdapter });
    const registerBusinessUseCase = new RegisterBusinessUseCase({
      crypto,
      idGenerator,
      businessRepository,
    });
    const authUseCase = new AuthUseCase({ jwt });
    const registerBusinessRouter = new RegisterBusinessRouter({
      emailValidator,
      registerBusinessUseCase,
      authUseCase,
    });
    return registerBusinessRouter;
  },
};

export default registerBusinessRouterComposer;
