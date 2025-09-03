import RegisterMenuItemRouter from "../../../presentation/routers/menu_item/register-menu-item-router.js";
import RegisterMenuItemUseCase from "../../../domain/usecase/menu_item/register-menu-item-usecase.js";
import validators from "../../../utils/validator.js";
import MenuItemRepository from "../../../infra/repositories/menu-item-repository.js";
import idGenerator from "../../../utils/id-generator.js";
import postgresAdapter from "../../../infra/adaptors/postgres-adapter.js";
import supabaseAdapter from "../../../infra/adaptors/supabase-adapter.js";

const registerMenuItemRouterComposer = {
  execute() {
    const menuItemRepository = new MenuItemRepository({ postgresAdapter });
    const registerMenuItemUseCase = new RegisterMenuItemUseCase({
      idGenerator,
      menuItemRepository,
      supabaseAdapter,
    });
    const registerMenuItemRouter = new RegisterMenuItemRouter({
      registerMenuItemUseCase,
      validators,
    });
    return registerMenuItemRouter;
  },
};

export default registerMenuItemRouterComposer;
