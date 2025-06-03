import { jest } from "@jest/globals";

jest.unstable_mockModule("validator", () => ({
  default: {
    isEmailValid: true,

    isEmail(email) {
      validator.default.isEmail.email = email;
      return validator.default.isEmailValid;
    },
  },
}));

import MissingParamError from "../../../utils/errors/missing-param-error.js";
const sut = (await import("../../../utils/email-validator.js")).default;
const validator = await import("validator");

describe("Email Validation", () => {
  test("Should return true if email is valid", () => {
    const isValid = sut.execute("valid_email@mail.com");
    expect(isValid).toBe(true);
  });

  test("Should return false if email is invalid", () => {
    validator.default.isEmailValid = false;
    const isValid = sut.execute("invalid_email@mail.com");
    expect(isValid).toBe(false);
  });

  test("Should call emailValidator with correct email", () => {
    sut.execute("valid_email@mail.com");
    expect(validator.default.isEmail.email).toBe("valid_email@mail.com");
  });

  test("Should throw if no email is provided", () => {
    expect(sut.execute).toThrow(new MissingParamError("email"));
  });
});
