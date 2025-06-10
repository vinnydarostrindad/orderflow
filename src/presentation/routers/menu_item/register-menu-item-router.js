import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../httpResponse.js";

export default class RegisterMenuItemRouter {
  constructor({ registerMenuItemUseCase } = {}) {
    this.registerMenuItemUseCase = registerMenuItemUseCase;
  }

  async route(httpRequest) {
    try {
      const { name, price, image_path, description, type } = httpRequest.body;
      const { menu_id } = httpRequest.params;

      if (!name) {
        return httpResponse.badRequest(new MissingParamError("name"));
      }
      if (!price) {
        return httpResponse.badRequest(new MissingParamError("price"));
      }
      if (!menu_id) {
        return httpResponse.badRequest(new MissingParamError("menu_id"));
      }

      const menu_item = await this.registerMenuItemUseCase.execute({
        menu_id,
        name,
        price,
        image_path,
        description,
        type,
      });
      if (!menu_item) {
        // Melhorar esse error
        return httpResponse.serverError();
      }

      return httpResponse.created(menu_item);
    } catch (err) {
      console.error(err);
      return httpResponse.serverError();
    }
  }
}
