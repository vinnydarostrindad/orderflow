import RegisterMenuRouter from "../../../presentation/routers/menu/register-menu-router.js";
import RegisterMenuUseCase from "../../../domain/usecase/menu/register-menu-usecase.js";
import MenuRepository from "../../../infra/repositories/menu-repository.js";
import idGenerator from "../../../utils/id-generator.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";

const registerMenuRouterComposer = {
  execute() {
    const menuRepository = new MenuRepository({ postgresAdapter });
    const registerMenuUseCase = new RegisterMenuUseCase({
      idGenerator,
      menuRepository,
    });
    const registerMenuRouter = new RegisterMenuRouter({ registerMenuUseCase });
    return registerMenuRouter;
  },
};

export default registerMenuRouterComposer;
