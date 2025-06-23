import MissingParamError from "../../../utils/errors/missing-param-error.js";
import InvalidaParamError from "../../../utils/errors/invalid-param-error.js";
import httpResponse from "../../http-response.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";

export default class GetMenuRouter {
  constructor({ getMenuUseCase, validators } = {}) {
    this.getMenuUseCase = getMenuUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
    const { businessId, menuId } = httpRequest.params;

    if (!businessId) {
      return httpResponse.badRequest(new MissingParamError("businessId"));
    }
    if (!this.validators.uuid(businessId)) {
      return httpResponse.badRequest(new InvalidaParamError("businessId"));
    }

    if (!menuId) {
      const menus = await this.getMenuUseCase.execute(businessId);

      const editedMenus = menus.map(({ id, name, created_at, updated_at }) => ({
        id,
        businessId,
        name,
        createdAt: created_at,
        updatedAt: updated_at,
      }));

      return httpResponse.ok(editedMenus);
    }

    const menu = await this.getMenuUseCase.execute(businessId, menuId);

    if (!menu) {
      return httpResponse.notFound("Menu", "Make sure menu exists.");
    }

    if (!this.validators.uuid(menuId)) {
      return httpResponse.badRequest(new InvalidParamError("menuId"));
    }

    const { name, created_at, updated_at } = menu;

    return httpResponse.ok({
      businessId,
      id: menuId,
      name,
      createdAt: created_at,
      updatedAt: updated_at,
    });
  }
}
