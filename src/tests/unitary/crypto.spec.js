import { jest } from "@jest/globals";

const mockCrypto = {
  hashedPassword: "any_hash",

  scrypt(password) {
    mockCrypto.password = password;
    return mockCrypto.hashedPassword;
  },
};

jest.unstable_mockModule("node:crypto", () => mockCrypto);

import MissingParamError from "../../utils/errors/missing-param-error";
const sut = (await import("../../utils/crypto.js")).default;

describe("Crypto", () => {
  test("Should throw if no password is provided", () => {
    expect(sut.hash).toThrow(new MissingParamError("password"));
  });

  test("Should return a hashed password", async () => {
    const hashedPassword = sut.hash("any_password");
    expect(hashedPassword).resolves.toBe("hashed_password");
  });
});
