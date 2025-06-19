import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import MissingParamError from "./errors/missing-param-error.js";
import DependencyError from "./errors/dependency-error.js";

const scryptPromise = promisify(scrypt);

const crypto = {
  async hash(password) {
    if (!password) {
      throw new MissingParamError("password");
    }

    try {
      const salt = randomBytes(16).toString("hex");
      const derivedKey = await scryptPromise(password, salt, 64);
      const hashedPassword = derivedKey.toString("hex");
      return `${hashedPassword}:${salt}`;
    } catch (error) {
      throw new DependencyError("node:crypto", {
        message: "Failed to hash",
        cause: error,
      });
    }
  },
};

export default crypto;
