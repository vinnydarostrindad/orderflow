import validator from "validator";
import MissingParamError from "./errors/missing-param-error";

export default class EmailValidator {
  execute(email) {
    if (!email) {
      throw new MissingParamError("email");
    }
    return validator.isEmail(email);
  }
}
