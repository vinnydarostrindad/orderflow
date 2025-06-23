import jwt from "jsonwebtoken";
import MissingParamError from "./errors/missing-param-error.js";
import DependencyError from "./errors/dependency-error.js";

const jsonWebToken = {
  sign(payload, secret) {
    if (!payload) throw new MissingParamError("payload");
    if (!secret) throw new MissingParamError("secret");

    try {
      return jwt.sign(payload, secret);
    } catch (error) {
      throw new DependencyError("jsonWebToken.sign", {
        message: "Failed to generate token",
        cause: error,
      });
    }
  },
};

export default jsonWebToken;
