import jwt from "jsonwebtoken";
import MissingParamError from "./errors/missing-param-error.js";

const jsonWebToken = {
  sign(payload, secret) {
    if (!payload) {
      throw new MissingParamError("payload");
    }
    if (!secret) {
      throw new MissingParamError("secret");
    }
    return jwt.sign(payload, secret);
  },
};

export default jsonWebToken;
