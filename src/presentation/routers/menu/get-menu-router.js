import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../httpResponse.js";

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
        const menu = await this.getMenuUseCase.execute(businessId);
        if (!menu) {
          return httpResponse.notFound("Menu");
        }

        menu.forEach((menu) => {
          const { created_at, updated_at } = menu;

          delete menu?.created_at;
          delete menu?.updated_at;
          delete menu?.business_id;

          menu.createdAt = created_at;
          menu.updatedAt = updated_at;
          menu.businessId = businessId;
        });

        return httpResponse.ok(menu);
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
