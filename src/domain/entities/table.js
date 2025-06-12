import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class Table {
  constructor({ id, businessId, number, name } = {}) {
    this.validate(id, businessId, number);

    this.id = id;
    this.businessId = businessId;
    this.number = number;
    this.name = name;
  }

  validate(id, businessId, number) {
    if (!id) {
      throw new MissingParamError("id");
    }
    if (!businessId) {
      throw new MissingParamError("businessId");
    }
    if (!number) {
      throw new MissingParamError("number");
    }
  }
}
