import validator from "validator";

export default class EmailValidator {
  execute(email) {
    return validator.isEmail(email);
  }
}
