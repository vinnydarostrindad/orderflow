import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../http-response.js";

export default class GetMenuRouter {
  constructor({ getMenuUseCase } = {}) {
    this.getMenuUseCase = getMenuUseCase;
  }

  async route(httpRequest) {
    try {
      const { businessId, menuId } = httpRequest.params;

      if (!businessId) {
        return httpResponse.badRequest(new MissingParamError("businessId"));
      }

      if (!menuId) {
        const menus = await this.getMenuUseCase.execute(businessId);
        if (!menus) {
          return httpResponse.notFound("Menu");
        }

        const editedMenus = menus.map(
          ({ id, name, created_at, updated_at }) => ({
            id,
            businessId,
            name,
            createdAt: created_at,
            updatedAt: updated_at,
          }),
        );

        return httpResponse.ok(editedMenus);
      }

      const menu = await this.getMenuUseCase.execute(businessId, menuId);

      if (!menu) {
        return httpResponse.notFound("Menu");
      }

      const { name, created_at, updated_at } = menu;

      return httpResponse.ok({
        businessId,
        id: menuId,
        name,
        createdAt: created_at,
        updatedAt: updated_at,
      });
    } catch (err) {
      console.error(err);
      return httpResponse.serverError();
    }
  }
}
