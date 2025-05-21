import MissingParamError from "./errors/missing-param-error";

const crypto = {
  hash(password) {
    if (!password) {
      throw new MissingParamError("password");
    }
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
