import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class Employee {
  constructor({ id, businessId, name, hashedPassword, role } = {}) {
    this.validate(id, businessId, name, hashedPassword, role);

    this.id = id;
    this.businessId = businessId;
    this.name = name;
    this.hashedPassword = hashedPassword;
    this.role = role;
  }

  validate(id, businessId, name, hashedPassword, role) {
    if (!id) {
      throw new MissingParamError("id");
    }
    if (!businessId) {
      throw new MissingParamError("businessId");
    }
    if (!name) {
      throw new MissingParamError("name");
    }
    if (!hashedPassword) {
      throw new MissingParamError("hashedPassword");
    }
    if (!role) {
      throw new MissingParamError("role");
    }
  }
}
