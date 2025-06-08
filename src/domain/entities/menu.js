import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class Menu {
  constructor({ id, business_id, name } = {}) {
    this.validate(id, business_id, name);

    this.id = id;
    this.business_id = business_id;
    this.name = name;
  }

  validate(id, business_id, name) {
    if (!id) {
      throw new MissingParamError("id");
    }
    if (!business_id) {
      throw new MissingParamError("business_id");
    }
    if (!name) {
      throw new MissingParamError("name");
    }
  }
}
