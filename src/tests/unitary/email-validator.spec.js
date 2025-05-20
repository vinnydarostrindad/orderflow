import EmailValidator from "../../utils/email-validator";
import MissingParamError from "../../utils/errors/missing-param-error";

const makeSut = () => {
  return new EmailValidator();
};

describe("Email Validation", () => {
  test("Should return true if email is valid", () => {
    const sut = makeSut();
    const isValid = sut.execute("valid_email@mail.com");
    expect(isValid).toBe(true);
  });

  test("Should return false if email is invalid", () => {
    const sut = makeSut();
    const isValid = sut.execute("invalid_email.com");
    expect(isValid).toBe(false);
  });

  test("Should throw if no email is provided", () => {
    const sut = makeSut();

    expect(sut.execute).toThrow(new MissingParamError("email"));
  });
});
