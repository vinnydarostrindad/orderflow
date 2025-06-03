import MissingParamError from "../../utils/errors/missing-param-error.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.development" });

export default class AuthUseCase {
  constructor({ jwt } = {}) {
    this.jwt = jwt;
  }

  generateToken(id) {
    if (!id) {
      throw new MissingParamError("id");
    }

    return this.jwt.sign(id, process.env.SECRET);
  }
}
