import { jest } from "@jest/globals";

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign(payload) {
      jwt.default.sign.payload = payload;

      if (jwt.default.sign.error) {
        jwt.default.sign.error = false;
        throw "Simulated Error";
      }

      return "any_token";
    },
    verify(token) {
      jwt.default.verify.token = token;

      if (jwt.default.verify.error) {
        jwt.default.verify.error = false;
        throw "Simulated Error";
      }

      return {
        businessId: "any_business_id",
        role: "any_role",
        employeeId: "any_employee_id",
      };
    },
  },
}));

import MissingParamError from "../../../utils/errors/missing-param-error.js";
import DependencyError from "../../../utils/errors/dependency-error.js";
const sut = (await import("../../../utils/jwt.js")).default;
const jwt = await import("jsonwebtoken");

describe("JWT", () => {
  describe("sign meth", () => {
    test("Should return token", () => {
      const token = sut.sign("any_payload");
      expect(token).toBe("any_token");
    });

    test("Should call sign with correct values", () => {
      sut.sign("any_payload", "secret");
      expect(jwt.default.sign.payload).toBe("any_payload");
    });

    test("Should throw if no payload is provided", () => {
      expect(() => sut.sign(null)).toThrow(new MissingParamError("payload"));
    });

    test("Should throw if token generation fails", () => {
      jwt.default.sign.error = true;

      expect(() => sut.sign("any_payload")).toThrow(
        new DependencyError("jsonWebToken.sign", {
          message: "Failed to generate token",
          cause: "Simulated Error",
        }),
      );
    });
  });

  describe("verify meth", () => {
    test("Should return employeeData", () => {
      const employeeData = sut.verify("any_token");
      expect(employeeData).toEqual({
        businessId: "any_business_id",
        role: "any_role",
        employeeId: "any_employee_id",
      });
    });

    test("Should call verkfy with correct values", () => {
      sut.verify("any_token", "secret");
      expect(jwt.default.verify.token).toBe("any_token");
    });

    test("Should throw if no token is provided", () => {
      expect(() => sut.verify()).toThrow(new MissingParamError("token"));
    });

    test("Should throw if token verification fails", () => {
      jwt.default.verify.error = true;

      expect(() => sut.verify("any_token")).toThrow(
        new DependencyError("jsonWebToken.verify", {
          message: "Failed to verify token",
          cause: "Simulated Error",
        }),
      );
    });
  });
});
