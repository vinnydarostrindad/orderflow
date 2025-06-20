import validator from "validator";
import MissingParamError from "./errors/missing-param-error.js";
const validators = {
  email(email) {
    if (!email) {
      throw new MissingParamError("email");
    }
    return validator.isEmail(email);
  },
  uuid(uuid) {
    if (!uuid) {
      throw new MissingParamError("uuid");
    }
    return validator.isUUID(uuid, 4);
  },
};

export default validators;
