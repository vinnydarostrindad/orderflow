import RegisterBusinessUseCase from "../../../domain/usecase/business/register-business-usecase.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

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

const makeCryptoWithError = () => {
  return {
    hash() {
      throw new Error();
    },
  };
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

const makeIdGeneratorWithError = () => {
  return {
    execute() {
      throw new Error();
    },
  };
};

const makeBusinessRepository = () => {
  class BusinessRepositorySpy {
    create({ id, name, email, hashedPassword }) {
      this.id = id;
      this.name = name;
      this.email = email;
      this.password = hashedPassword;
      return this.business;
    }
  }

  const businessRepositorySpy = new BusinessRepositorySpy();
  businessRepositorySpy.business = {
    id: "any_id",
    name: "any_name",
    email: "any_email@mail.com",
    password: "any_hash",
  };
  return businessRepositorySpy;
};

const makeBusinessRepositoryWithError = () => {
  class BusinessRepositorySpy {
    create() {
      throw new Error();
    }
  }

  return new BusinessRepositorySpy();
};

describe("Register Business UseCase", () => {
  test("Should throw if no props are provided ", async () => {
    const { sut } = makeSut();
    await expect(sut.execute()).rejects.toThrow(new MissingParamError("name"));
  });

  test("Should throw if no name is provided ", async () => {
    const { sut } = makeSut();
    const props = {
      email: "any_email@mail.com",
      password: "any_password",
    };
    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("name"),
    );
  });

  test("Should throw if no email is provided ", async () => {
    const { sut } = makeSut();
    const props = {
      name: "any_name",
      password: "any_password",
    };
    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("email"),
    );
  });

  test("Should throw if no password is provided ", async () => {
    const { sut } = makeSut();
    const props = {
      name: "any_name",
      email: "any_email@mail.com",
    };
    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("password"),
    );
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

    const business = await sut.execute(props);
    expect(business).toBeNull();
  });

  test("Should return null if idGenerator returns invalid id", async () => {
    const { sut, idGeneratorSpy } = makeSut();
    const props = {
      name: "any_name",
      email: "any_email@mail.com",
      password: "any_password",
    };
    idGeneratorSpy.id = null;

    const business = await sut.execute(props);
    expect(business).toBeNull();
  });

  test("Should call businessRepository with correct values", async () => {
    const { sut, businessRepositorySpy, cryptoSpy, idGeneratorSpy } = makeSut();
    const props = {
      name: "any_name",
      email: "any_email@mail.com",
      password: "any_password",
    };

    await sut.execute(props);
    expect(businessRepositorySpy.id).toBe(idGeneratorSpy.id);
    expect(businessRepositorySpy.name).toBe("any_name");
    expect(businessRepositorySpy.email).toBe("any_email@mail.com");
    expect(businessRepositorySpy.password).toBe(cryptoSpy.hashedPassword);
  });

  test("Should return null if businessRepository returns invalid business", async () => {
    const { sut, businessRepositorySpy } = makeSut();
    const props = {
      name: "any_name",
      email: "any_email@mail.com",
      password: "any_password",
    };
    businessRepositorySpy.business = null;

    const business = await sut.execute(props);
    expect(business).toBeNull();
  });

  test("Should return business if everything is right", async () => {
    const { sut } = makeSut();
    const props = {
      name: "any_name",
      email: "any_email@mail.com",
      password: "any_password",
    };

    const business = await sut.execute(props);
    expect(business).toEqual({
      id: "any_id",
      name: "any_name",
      email: "any_email@mail.com",
      password: "any_hash",
    });
  });

  test("Should throw if invalid dependencieses are provided", async () => {
    const crypto = makeCrypto();
    const idGenerator = makeIdGenerator();
    const suts = [
      new RegisterBusinessUseCase(),
      new RegisterBusinessUseCase({}),
      new RegisterBusinessUseCase({
        crypto: {},
      }),
      new RegisterBusinessUseCase({
        crypto,
      }),
      new RegisterBusinessUseCase({
        crypto,
        idGenerator: {},
      }),
      new RegisterBusinessUseCase({
        crypto,
        idGenerator,
      }),
      new RegisterBusinessUseCase({
        crypto,
        idGenerator,
        businessRepository: {},
      }),
    ];
    const props = {
      name: "any_name",
      email: "any_email@mail.com",
      password: "any_password",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if any dependency throws", async () => {
    const crypto = makeCrypto();
    const idGenerator = makeIdGenerator();
    const suts = [
      new RegisterBusinessUseCase({
        crypto: makeCryptoWithError(),
      }),
      new RegisterBusinessUseCase({
        crypto,
        idGenerator: makeIdGeneratorWithError(),
      }),
      new RegisterBusinessUseCase({
        crypto,
        idGenerator,
        businessRepository: makeBusinessRepositoryWithError(),
      }),
    ];
    const props = {
      name: "any_name",
      email: "any_email@mail.com",
      password: "any_password",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow();
    }
  });
});
