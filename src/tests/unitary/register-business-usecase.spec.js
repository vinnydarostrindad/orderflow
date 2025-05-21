import RegisterBusinessUseCase from "../../domain/usecase/register-business-usecase.js";
import MissingParamError from "../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const cryptoSpy = makeCrypto();
  const idGeneratorSpy = makeIdGenerator();
  const businessRepositorySpy = makeBusinessRepository();
  const sut = new RegisterBusinessUseCase({
    crypto: cryptoSpy,
    idGenerator: idGeneratorSpy,
    businessRepository: businessRepositorySpy,
  });
  return {
    sut,
    cryptoSpy,
    idGeneratorSpy,
    businessRepositorySpy,
  };
};

const makeCrypto = () => {
  const cryptoSpy = {
    hash(password) {
      this.password = password;
      return this.hashedPassword;
    },
  };

  cryptoSpy.hashedPassword = "any_hash";
  return cryptoSpy;
};

const makeIdGenerator = () => {
  const idGeneratorSpy = {
    execute() {
      return this.id;
    },
  };

  idGeneratorSpy.id = "any_id";
  return idGeneratorSpy;
};

const makeBusinessRepository = () => {
  const businessRepositorySpy = {
    create(id, name, email, hashedPassword) {
      this.id = id;
      this.name = name;
      this.email = email;
      this.password = hashedPassword;
      return this.user;
    },
  };

  businessRepositorySpy.user = {
    id: "any_id",
    name: "any_name",
    email: "any_email@mail.com",
    password: "any_hash",
  };
  return businessRepositorySpy;
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
    const { sut, cryptoSpy } = makeSut();
    const props = {
      name: "any_name",
      email: "any_email@mail.com",
      password: "any_password",
    };
    await sut.execute(props);
    expect(cryptoSpy.password).toBe(props.password);
  });

  test("Should return null if crypto returns invalid hash", async () => {
    const { sut, cryptoSpy } = makeSut();
    const props = {
      name: "any_name",
      email: "any_email@mail.com",
      password: "any_password",
    };
    cryptoSpy.hashedPassword = null;
    const user = await sut.execute(props);
    expect(user).toBeNull();
  });

  test("Should return null if idGenerator returns invalid id", async () => {
    const { sut, idGeneratorSpy } = makeSut();
    const props = {
      name: "any_name",
      email: "any_email@mail.com",
      password: "any_password",
    };
    idGeneratorSpy.id = null;
    const user = await sut.execute(props);
    expect(user).toBeNull();
  });

  test("Should call businessRepository with correct values", async () => {
    const { sut, businessRepositorySpy, cryptoSpy, idGeneratorSpy } = makeSut();
    const props = {
      name: "any_name",
      email: "any_email@mail.com",
      password: "any_password",
    };
    await sut.execute(props);
    expect(businessRepositorySpy.user.id).toBe(idGeneratorSpy.id);
    expect(businessRepositorySpy.user.name).toBe("any_name");
    expect(businessRepositorySpy.user.email).toBe("any_email@mail.com");
    expect(businessRepositorySpy.user.password).toBe(cryptoSpy.hashedPassword);
  });
});
