import GetMenuItemRouter from "../../../presentation/routers/menu_item/get-menu-item-router.js";
import GetMenuItemUseCase from "../../../domain/usecase/menu_item/get-menu-item-usecase.js";
import validators from "../../../utils/validator.js";
import MenuItemRepository from "../../../infra/repositories/menu-item-repository.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";

const getMenuItemRouterComposer = {
  execute() {
    const menuItemRepository = new MenuItemRepository({ postgresAdapter });
    const getMenuItemUseCase = new GetMenuItemUseCase({ menuItemRepository });
    const getMenuItemRouter = new GetMenuItemRouter({
      getMenuItemUseCase,
      validators,
    });
    return getMenuItemRouter;
  },
};

export default getMenuItemRouterComposer;
