import BusinessRepository from "../../infra/repositories/business-repository.js";
import MissingParamError from "../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const sut = new BusinessRepository();
  return {
    sut,
  };
};

describe("Business Repository", () => {
  test("Should throw if no id is provided", () => {
    const { sut } = makeSut();
    const props = {
      name: "any_name",
      email: "any_email",
      password: "any_hash",
    };
    const promise = sut.create(props);
    expect(promise).rejects.toThrow(new MissingParamError("id"));
  });

  test("Should throw if no name is provided", () => {
    const { sut } = makeSut();
    const props = {
      id: "any_id",
      email: "any_email",
      password: "any_hash",
    };
    const promise = sut.create(props);
    expect(promise).rejects.toThrow(new MissingParamError("name"));
  });

  test("Should throw if no email is provided", () => {
    const { sut } = makeSut();
    const props = {
      id: "any_id",
      name: "any_name",
      password: "any_hash",
    };
    const promise = sut.create(props);
    expect(promise).rejects.toThrow(new MissingParamError("email"));
  });

  test("Should throw if no password is provided", () => {
    const { sut } = makeSut();
    const props = {
      id: "any_id",
      name: "any_name",
      email: "any_email",
    };
    const promise = sut.create(props);
    expect(promise).rejects.toThrow(new MissingParamError("password"));
  });
});
