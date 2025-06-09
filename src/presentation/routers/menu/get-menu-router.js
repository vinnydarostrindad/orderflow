import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../httpResponse.js";

export default class GetMenuRouter {
  constructor({ getMenuUseCase } = {}) {
    this.getMenuUseCase = getMenuUseCase;
  }

  async route(httpRequest) {
    try {
      const { business_id, menu_id } = httpRequest.params;

      if (!business_id) {
        return httpResponse.badRequest(new MissingParamError("business_id"));
      }

      if (!menu_id) {
        const menu = await this.getMenuUseCase.execute(business_id);
        if (!menu) {
          return httpResponse.notFound("Menu");
        }

        menu.forEach((menu) => {
          delete menu?.password;
        });

        return httpResponse.ok(menu);
      }

      const menu = await this.getMenuUseCase.execute(business_id, menu_id);

      if (!menu) {
        return httpResponse.notFound("Menu");
      }

      const { name, created_at, updated_at } = menu;

      return httpResponse.ok({
        business_id,
        id: menu_id,
        name,
        created_at,
        updated_at,
      });
    } catch (err) {
      console.error(err);
      return httpResponse.serverError();
    }
  }
}
