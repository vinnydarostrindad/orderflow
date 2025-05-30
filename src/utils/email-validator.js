import validator from "validator";
import MissingParamError from "./errors/missing-param-error";

const emailValidator = {
  execute(email) {
    if (!email) {
      throw new MissingParamError("email");
    }
    return validator.isEmail(email);
  },
};

export default emailValidator;
