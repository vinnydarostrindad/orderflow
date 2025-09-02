import InvalidParamError from "../../utils/errors/invalid-param-error.js";
import MissingParamError from "../../utils/errors/missing-param-error.js";

import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.development" });
}

export default class AuthUseCase {
  constructor({ jwt } = {}) {
    this.jwt = jwt;
  }

  generateToken(payload) {
    if (!payload) throw new MissingParamError("payload");
    if (typeof payload !== "object" || Array.isArray(payload)) {
      throw new InvalidParamError("payload");
    }
    if (Object.keys(payload).length === 0) {
      throw new InvalidParamError("payload");
    }

    return this.jwt.sign(payload, process.env.SECRET);
  }
}
