import MissingParamError from "../../../utils/errors/missing-param-error.js";
import httpResponse from "../../httpResponse.js";

export default class RegisterMenuItemRouter {
  constructor({ registerMenuItemUseCase } = {}) {
    this.registerMenuItemUseCase = registerMenuItemUseCase;
  }

  async route(httpRequest) {
    try {
      const { name, price, imagePath, description, type } = httpRequest.body;
      const { menuId } = httpRequest.params;

      if (!name) {
        return httpResponse.badRequest(new MissingParamError("name"));
      }
      if (!price) {
        return httpResponse.badRequest(new MissingParamError("price"));
      }
      if (!menuId) {
        return httpResponse.badRequest(new MissingParamError("menuId"));
      }

      const menuItem = await this.registerMenuItemUseCase.execute({
        menuId,
        name,
        price,
        imagePath,
        description,
        type,
      });
      if (!menuItem) {
        // Melhorar esse error
        return httpResponse.serverError();
      }

      return httpResponse.created(menuItem);
    } catch (err) {
      console.error(err);
      return httpResponse.serverError();
    }
  }
}
