import { scrypt } from "node:crypto";
import { promisify } from "node:util";
import MissingParamError from "./errors/missing-param-error";

const scryptPromise = promisify(scrypt);

const crypto = {
  async hash(password) {
    if (!password) {
      throw new MissingParamError("password");
    }
    const derivedKey = await scryptPromise(password, "salt", 64);
    return derivedKey.toString("hex");
  },
};

export default crypto;

// function hashPassword(password) {
//   return new Promise((resolve, reject) => {
//     scrypt(password, "salt", 64, (err, derivedKey) => {
//       if (err) reject(`Erro ao encriptar senha: ${err}`);

//       resolve(derivedKey.toString("hex"));
//     });
//   });
// }

// export default hashPassword;
