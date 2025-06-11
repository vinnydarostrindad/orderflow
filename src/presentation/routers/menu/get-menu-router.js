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
          delete menu?.password;
        });

        return httpResponse.ok(menu);
      }

      const menu = await this.getMenuUseCase.execute(businessId, menuId);

      if (!menu) {
        return httpResponse.notFound("Menu");
      }

      const { name, createdAt, updatedAt } = menu;

      return httpResponse.ok({
        businessId,
        id: menuId,
        name,
        createdAt,
        updatedAt,
      });
    } catch (err) {
      console.error(err);
      return httpResponse.serverError();
    }
  }
}
