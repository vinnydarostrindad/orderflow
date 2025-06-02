import * as validator from "validator";
import MissingParamError from "./errors/missing-param-error.js";

const emailValidator = {
  execute(email) {
    if (!email) {
      throw new MissingParamError("email");
    }
    return validator.isEmail(email);
  },
};

export default emailValidator;
