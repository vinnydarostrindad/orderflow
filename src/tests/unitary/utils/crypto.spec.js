import { jest } from "@jest/globals";

jest.unstable_mockModule("node:crypto", () => ({
  scrypt(password, salt, keylen, callback) {
    scrypt.password = password;
    // Simula o retorno de um "Buffer"
    const fakeBuffer = {
      toString(encoding) {
        if (encoding === "hex") return "hashed_password";
      },
    };
    callback(null, fakeBuffer); // Simula sucesso
  },
}));

import MissingParamError from "../../../utils/errors/missing-param-error.js";
const sut = (await import("../../../utils/crypto.js")).default;
const { scrypt } = await import("node:crypto");

describe("Crypto", () => {
  test("Should throw if no password is provided", () => {
    expect(sut.hash).rejects.toThrow(new MissingParamError("password"));
  });

  test("Should return a hashed password", async () => {
    const hashedPassword = await sut.hash("any_password");
    expect(hashedPassword).toBe("hashed_password");
  });

  test("Should call scrypt with correct password", async () => {
    sut.hash("any_password");
    expect(scrypt.password).toBe("any_password");
  });
});
