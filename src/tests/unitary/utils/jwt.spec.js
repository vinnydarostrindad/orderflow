import { jest } from "@jest/globals";

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign(payload, secret) {
      jwt.default.sign.payload = payload;
      jwt.default.sign.secret = secret;
      return "any_token";
    },
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
    expect(jwt.default.sign.payload).toBe("any_payload");
    expect(jwt.default.sign.secret).toBe("secret");
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
