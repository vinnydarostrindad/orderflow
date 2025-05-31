import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class Employee {
  constructor({ id, business_id, name, hashedPassword, role } = {}) {
    this.validate(id, business_id, name, hashedPassword, role);

    this.id = id;
    this.business_id = business_id;
    this.name = name;
    this.hashedPassword = hashedPassword;
    this.role = role;
  }

  validate(id, business_id, name, hashedPassword, role) {
    if (!id) {
      throw new MissingParamError("id");
    }
    if (!business_id) {
      throw new MissingParamError("business_id");
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
