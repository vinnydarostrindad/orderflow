import { jest } from "@jest/globals";

jest.unstable_mockModule("validator", () => ({
  default: {
    isEmailValid: true,
    isUUIDValid: true,

    isEmail(email) {
      validator.default.isEmail.email = email;
      return validator.default.isEmailValid;
    },

    isUUID(uuid) {
      validator.default.isUUID.uuid = uuid;
      return validator.default.isUUIDValid;
    },
  },
}));

import MissingParamError from "../../../utils/errors/missing-param-error.js";
const sut = (await import("../../../utils/validator.js")).default;
const validator = await import("validator");

describe("Validator", () => {
  describe("isEmail Method", () => {
    test("Should return true if email is valid", () => {
      const isValid = sut.email("valid_email@mail.com");
      expect(isValid).toBe(true);
    });

    test("Should return false if email is invalid", () => {
      validator.default.isEmailValid = false;
      const isValid = sut.email("invalid_email@mail.com");
      expect(isValid).toBe(false);
    });

    test("Should call isEmail with correct email", () => {
      sut.email("any_email@mail.com");
      expect(validator.default.isEmail.email).toBe("any_email@mail.com");
    });

    test("Should throw if no email is provided", () => {
      expect(sut.email).toThrow(new MissingParamError("email"));
    });
  });

  describe("isUUID Method", () => {
    test("Should return true if uuid is valid", () => {
      const isValid = sut.uuid("valid_uuid");
      expect(isValid).toBe(true);
    });

    test("Should return false if uuid is invalid", () => {
      validator.default.isUUIDValid = false;
      const isValid = sut.email("invalid_uuid");
      expect(isValid).toBe(false);
    });

    test("Should call isUUID with correct uuid", () => {
      sut.uuid("any_uuid");
      expect(validator.default.isUUID.uuid).toBe("any_uuid");
    });

    test("Should throw if no uuid is provided", () => {
      expect(sut.uuid).toThrow(new MissingParamError("uuid"));
    });
  });
});
