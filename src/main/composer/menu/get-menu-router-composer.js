import GetMenuRouter from "../../../presentation/routers/menu/get-menu-router.js";
import GetMenuUseCase from "../../../domain/usecase/menu/get-menu-usecase.js";
import MenuRepository from "../../../infra/repositories/menu-repository.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";

const getMenuRouterComposer = {
  execute() {
    const menuRepository = new MenuRepository({ postgresAdapter });
    const getMenuUseCase = new GetMenuUseCase({ menuRepository });
    const getMenuRouter = new GetMenuRouter({ getMenuUseCase });
    return getMenuRouter;
  },
};

export default getMenuRouterComposer;
