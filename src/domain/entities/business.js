import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class Business {
  constructor({ id, name, email, hashedPassword } = {}) {
    this.validate(id, name, email, hashedPassword);

    this.id = id;
    this.name = name;
    this.email = email;
    this.hashedPassword = hashedPassword;
  }

  validate(id, name, email, hashedPassword) {
    if (!id) {
      throw new MissingParamError("id");
    }
    if (!name) {
      throw new MissingParamError("name");
    }
    if (!email) {
      throw new MissingParamError("email");
    }
    if (!hashedPassword) {
      throw new MissingParamError("hashedPassword");
    }
  }
}
