import { jest } from "@jest/globals";

jest.unstable_mockModule("jsonwebtoken", () => ({
  sign(payload, secret) {
    jwt.sign.payload = payload;
    jwt.sign.secret = secret;
    return "any_token";
  },
}));

import MissingParamError from "../../../utils/errors/missing-param-error.js";
const sut = (await import("../../../utils/jwt.js")).default;
const jwt = await import("jsonwebtoken");

describe("JWT", () => {
  test("Should return token", () => {
    const token = sut.sign("any_payload", "secret");
    expect(token).toBe("any_token");
  });

  test("Should call sign with correct values", () => {
    sut.sign("any_payload", "secret");
    expect(jwt.sign.payload).toBe("any_payload");
    expect(jwt.sign.secret).toBe("secret");
  });

  test("Should throw if no payload is provided", () => {
    expect(() => sut.sign(null, "secret")).toThrow(
      new MissingParamError("payload"),
    );
  });

  test("Should throw if no secret is provided", () => {
    expect(() => sut.sign("any_payload")).toThrow(
      new MissingParamError("secret"),
    );
  });
});
