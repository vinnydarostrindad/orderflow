import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../httpResponse.js";

export default class GetMenuItemRouter {
  constructor({ getMenuItemUseCase } = {}) {
    this.getMenuItemUseCase = getMenuItemUseCase;
  }

  async route(httpRequest) {
    try {
      const { menuId, menuItemId } = httpRequest.params;

      if (!menuId) {
        return httpResponse.badRequest(new MissingParamError("menuId"));
      }

      if (!menuItemId) {
        const menuItems = await this.getMenuItemUseCase.execute(menuId);
        if (!menuItems) {
          return httpResponse.notFound("MenuItem");
        }

        menuItems.forEach((menuItem) => {
          const { image_path, created_at, updated_at } = menuItem;

          delete menuItem?.menu_id;
          delete menuItem?.image_path;
          delete menuItem?.created_at;
          delete menuItem?.updated_at;

          menuItem.createdAt = created_at;
          menuItem.updatedAt = updated_at;
          menuItem.menuId = menuId;
          menuItem.imagePath = image_path;
        });

        return httpResponse.ok(menuItems);
      }

      const menuItem = await this.getMenuItemUseCase.execute(
        menuId,
        menuItemId,
      );

      if (!menuItem) {
        return httpResponse.notFound("MenuItem");
      }

      const { image_path, created_at, updated_at } = menuItem;

      delete menuItem?.menu_id;
      delete menuItem?.image_path;
      delete menuItem?.created_at;
      delete menuItem?.updated_at;

      menuItem.createdAt = created_at;
      menuItem.updatedAt = updated_at;
      menuItem.menuId = menuId;
      menuItem.imagePath = image_path;

      return httpResponse.ok(menuItem);
    } catch (err) {
      console.error(err);
      return httpResponse.serverError();
    }
  }
}
