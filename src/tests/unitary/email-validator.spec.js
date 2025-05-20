import EmailValidator from "../../utils/email-validator";

const makeSut = () => {
  return new EmailValidator();
};

describe("Email Valid", () => {
  test("Should return true if email is valid", () => {
    const sut = makeSut();
    const isValid = sut.execute("valid_email@mail.com");
    expect(isValid).toBe(true);
  });
});
