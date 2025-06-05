import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import MissingParamError from "./errors/missing-param-error.js";

const scryptPromise = promisify(scrypt);

const crypto = {
  async hash(password) {
    if (!password) {
      throw new MissingParamError("password");
    }

    const salt = randomBytes(16).toString("hex");
    const derivedKey = await scryptPromise(password, salt, 64);
    const hashedPassword = derivedKey.toString("hex");
    return `${hashedPassword}:${salt}`;
  },
};

export default crypto;
