import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class MenuItem {
  constructor({
    id,
    menu_id,
    name,
    price,
    image_path,
    description,
    type,
  } = {}) {
    this.validate(id, menu_id, name, price);

    this.id = id;
    this.menu_id = menu_id;
    this.name = name;
    this.price = price;
    this.image_path = image_path;
    this.description = description;
    this.type = type;
  }

  validate(id, menu_id, name, price) {
    if (!id) {
      throw new MissingParamError("id");
    }
    if (!menu_id) {
      throw new MissingParamError("menu_id");
    }
    if (!name) {
      throw new MissingParamError("name");
    }
    if (!price) {
      throw new MissingParamError("price");
    }
  }
}
