import RegisterBusinessUseCase from "../../domain/usecase/register-business-usecase.js";
import MissingParamError from "../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const crypto = makeEncrypter();
  const sut = new RegisterBusinessUseCase({ crypto });
  return {
    sut,
    crypto,
  };
};

const makeEncrypter = () => {
  const crypto = {
    hash(password) {
      this.password = password;
      return this.hashedPassword;
    },
  };

  crypto.hashedPassword = "any_hash";
  return crypto;
};

describe("Register Business UseCase", () => {
  test("Should throw if no name is provided ", () => {
    const { sut } = makeSut();
    const props = {
      email: "any_email@mail.com",
      password: "any_password",
    };
    const promise = sut.execute(props);
    expect(promise).rejects.toThrow(new MissingParamError("name"));
  });

  test("Should throw if no email is provided ", () => {
    const { sut } = makeSut();
    const props = {
      name: "any_name",
      password: "any_password",
    };
    const promise = sut.execute(props);
    expect(promise).rejects.toThrow(new MissingParamError("email"));
  });

  test("Should throw if no password is provided ", () => {
    const { sut } = makeSut();
    const props = {
      name: "any_name",
      email: "any_email@mail.com",
    };
    const promise = sut.execute(props);
    expect(promise).rejects.toThrow(new MissingParamError("password"));
  });

  test("Should call crypto with correct password", async () => {
    const { sut, crypto } = makeSut();
    const props = {
      name: "any_name",
      email: "any_email@mail.com",
      password: "any_password",
    };
    await sut.execute(props);
    expect(crypto.password).toBe(props.password);
  });

  test("Should return null if crypto returns invalid hash", async () => {
    const { sut, crypto } = makeSut();
    const props = {
      name: "any_name",
      email: "any_email@mail.com",
      password: "any_password",
    };
    crypto.hashedPassword = null;
    const user = await sut.execute(props);
    expect(user).toBeNull();
  });
});
