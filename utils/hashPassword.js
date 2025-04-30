import { scrypt } from "node:crypto";

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    scrypt(password, "salt", 64, (err, derivedKey) => {
      if (err) reject(`Erro ao encriptar senha: ${err}`);

      resolve(derivedKey.toString("hex"));
    });
  });
}

export default hashPassword;
