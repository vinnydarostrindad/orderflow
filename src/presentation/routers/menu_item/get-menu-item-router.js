import MissingParamError from "../../../utils/errors/missing-param-error.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import httpResponse from "../../http-response.js";

export default class GetMenuItemRouter {
  constructor({ getMenuItemUseCase, validators } = {}) {
    this.getMenuItemUseCase = getMenuItemUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { menuId, menuItemId } = httpRequest.params;

    if (!menuId) {
      return httpResponse.badRequest(new MissingParamError("menuId"));
    }
    if (!this.validators.uuid(menuId)) {
      return httpResponse.badRequest(new InvalidParamError("menuId"));
    }

    if (!menuItemId) {
      const menuItems = await this.getMenuItemUseCase.execute(menuId);

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

    if (!this.validators.uuid(menuItemId)) {
      return httpResponse.badRequest(new InvalidParamError("menuItemId"));
    }

    const menuItem = await this.getMenuItemUseCase.execute(menuId, menuItemId);

    if (!menuItem) {
      return httpResponse.notFound("MenuItem", "Make sure menu item exists.");
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
  }
}
