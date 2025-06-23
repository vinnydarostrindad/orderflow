import { jest } from "@jest/globals";

jest.unstable_mockModule("node:crypto", () => ({
  scrypt(password, salt, keylen, callback) {
    scrypt.password = password;
    scrypt.salt = salt;
    scrypt.keylen = keylen;

    // Simula o retorno de um "Buffer"
    if (scrypt.error) {
      scrypt.error = false;
      throw "Simulated Error";
    }

    const fakeBuffer = {
      toString(encoding) {
        if (encoding === "hex") return "hashed_password";
      },
    };
    callback(null, fakeBuffer); // Simula sucesso
  },
  randomBytes(bytes) {
    randomBytes.bytes = bytes;
    return Buffer.from("a".repeat(32), "hex");
  },
}));

import MissingParamError from "../../../utils/errors/missing-param-error.js";
import DependencyError from "../../../utils/errors/dependency-error.js";
import { randomBytes } from "node:crypto";
const sut = (await import("../../../utils/crypto.js")).default;
const { scrypt } = await import("node:crypto");

describe("Crypto", () => {
  test("Should throw if no password is provided", async () => {
    await expect(sut.hash()).rejects.toThrow(new MissingParamError("password"));
  });

  test("Should return a hashed password", async () => {
    const hashedPassword = await sut.hash("any_password");
    expect(hashedPassword).toBe(`hashed_password:${scrypt.salt}`);
  });

  test("Should call scrypt with correct password", async () => {
    await sut.hash("any_password");
    expect(scrypt.password).toBe("any_password");
    expect(typeof scrypt.salt).toBe("string");
    expect(scrypt.keylen).toBe(64);
  });

  test("Should call randomBytes with correct value", async () => {
    await sut.hash("any_password");
    expect(randomBytes.bytes).toBe(16);
  });

  test("Should throw if hash fails", async () => {
    scrypt.error = true;

    await expect(sut.hash("any_password")).rejects.toThrow(
      new DependencyError("node:crypto", {
        message: "Failed to hash",
        cause: "Simulated Error",
      }),
    );
  });
});
