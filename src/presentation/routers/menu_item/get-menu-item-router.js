import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../http-response.js";

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

        const editedMenuItems = menuItems.map(
          ({
            id,
            name,
            price,
            image_path,
            description,
            type,
            created_at,
            updated_at,
          }) => ({
            id,
            menuId,
            name,
            price,
            imagePath: image_path,
            description,
            type,
            createdAt: created_at,
            updatedAt: updated_at,
          }),
        );

        return httpResponse.ok(editedMenuItems);
      }

      const menuItem = await this.getMenuItemUseCase.execute(
        menuId,
        menuItemId,
      );

      if (!menuItem) {
        return httpResponse.notFound("MenuItem");
      }

      const {
        id,
        name,
        price,
        image_path,
        description,
        type,
        created_at,
        updated_at,
      } = menuItem;

      return httpResponse.ok({
        id,
        menuId,
        name,
        price,
        imagePath: image_path,
        description,
        type,
        createdAt: created_at,
        updatedAt: updated_at,
      });
    } catch (err) {
      console.error(err);
      return httpResponse.serverError();
    }
  }
}
