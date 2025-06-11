import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class MenuItem {
  constructor({ id, menuId, name, price, imagePath, description, type } = {}) {
    this.validate(id, menuId, name, price);

    this.id = id;
    this.menuId = menuId;
    this.name = name;
    this.price = price;
    this.imagePath = imagePath;
    this.description = description;
    this.type = type;
  }

  validate(id, menuId, name, price) {
    if (!id) {
      throw new MissingParamError("id");
    }
    if (!menuId) {
      throw new MissingParamError("menuId");
    }
    if (!name) {
      throw new MissingParamError("name");
    }
    if (!price) {
      throw new MissingParamError("price");
    }
  }
}
