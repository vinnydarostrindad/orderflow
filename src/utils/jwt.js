import jwt from "jsonwebtoken";
import MissingParamError from "./errors/missing-param-error.js";
import DependencyError from "./errors/dependency-error.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.development" });

const SECRET = process.env.SECRET;

const jsonWebToken = {
  sign(payload) {
    if (!payload) throw new MissingParamError("payload");

    try {
      return jwt.sign(payload, SECRET);
    } catch (error) {
      throw new DependencyError("jsonWebToken.sign", {
        message: "Failed to generate token",
        cause: error,
      });
    }
  },
  verify(token) {
    if (!token) throw new MissingParamError("token");

    try {
      return jwt.verify(token, SECRET);
    } catch (error) {
      throw new DependencyError("jsonWebToken.verify", {
        message: "Failed to verify token",
        cause: error,
      });
    }
  },
};

export default jsonWebToken;
