import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class Menu {
  constructor({ id, businessId, name } = {}) {
    this.validate(id, businessId, name);

    this.id = id;
    this.businessId = businessId;
    this.name = name;
  }

  validate(id, businessId, name) {
    if (!id) throw new MissingParamError("id");
    if (!businessId) throw new MissingParamError("businessId");
    if (!name) throw new MissingParamError("name");
  }
}
