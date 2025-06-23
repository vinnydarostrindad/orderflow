import { jest } from "@jest/globals";

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign(payload, secret) {
      jwt.default.sign.payload = payload;
      jwt.default.sign.secret = secret;

      if (jwt.default.sign.error) {
        jwt.default.sign.error = false;
        throw "Simulated Error";
      }

      return "any_token";
    },
  },
}));

import MissingParamError from "../../../utils/errors/missing-param-error.js";
import DependencyError from "../../../utils/errors/dependency-error.js";
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

  test("Should throw if token generation fails", () => {
    jwt.default.sign.error = true;

    expect(() => sut.sign("any_payload", "secret")).toThrow(
      new DependencyError("jsonWebToken.sign", {
        message: "Failed to generate token",
        cause: "Simulated Error",
      }),
    );
  });
});
