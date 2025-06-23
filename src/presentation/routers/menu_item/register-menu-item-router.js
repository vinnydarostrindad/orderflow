import MissingParamError from "../../../utils/errors/missing-param-error.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import httpResponse from "../../http-response.js";

export default class RegisterMenuItemRouter {
  constructor({ registerMenuItemUseCase, validators } = {}) {
    this.registerMenuItemUseCase = registerMenuItemUseCase;
    this.validators = validators;
  }

  async route(httpRequest) {
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
    if (!this.validators.uuid(menuId)) {
      return httpResponse.badRequest(new InvalidParamError("menuId"));
    }

    const menuItem = await this.registerMenuItemUseCase.execute({
      menuId,
      name,
      price,
      imagePath,
      description,
      type,
    });

    return httpResponse.created(menuItem);
  }
}
