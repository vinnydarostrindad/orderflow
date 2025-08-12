import RegisterBusinessRouter from "../../../presentation/routers/business/register-business-router.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";

const makeSut = () => {
  const registerBusinessUseCaseSpy = makeRegisterBusinessUseCase();
  const validatorsSpy = makeValidators();
  const sut = new RegisterBusinessRouter({
    registerBusinessUseCase: registerBusinessUseCaseSpy,
    validators: validatorsSpy,
  });

  return {
    sut,
    registerBusinessUseCaseSpy,
    validatorsSpy,
  };
};

const makeRegisterBusinessUseCase = () => {
  class RegisterBusinessUseCaseSpy {
    execute({ name, email, password }) {
      this.name = name;
      this.email = email;
      this.password = password;
      return this.business;
    }
  }

  const registerBusinessUseCaseSpy = new RegisterBusinessUseCaseSpy();
  registerBusinessUseCaseSpy.business = {
    id: "any_id",
    name: "any_name",
    email: "any_email@mail.com",
    password: "any_password",
  };
  return registerBusinessUseCaseSpy;
};

const makeRegisterBusinessUseCaseWithError = () => {
  class registerBusinessUseCaseSpy {
    execute() {
      throw new Error();
    }
  }

  return new registerBusinessUseCaseSpy();
};

const makeValidators = () => {
  const validatorsSpy = {
    email(emailValue) {
      this.emailValue = emailValue;
      return this.isValid;
    },
  };

  validatorsSpy.isValid = true;

  return validatorsSpy;
};

const makeValidatorsWithError = () => {
  const validatorsSpy = {
    email() {
      throw new Error();
    },
  };

  return validatorsSpy;
};

describe("Register Business Router", () => {
  test("Should return 400 if no name is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: "any_email@mail.com",
        password: "any_password",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("name"));
  });

  test("Should return 400 if no email is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        password: "any_password",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("email"));
  });

  test("Should return 400 if no password is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        email: "any_email@mail.com",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("password"));
  });

  test("Should return 400 if invalid email is provided", async () => {
    const { sut, validatorsSpy } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        email: "invalid_email@mail.com",
        password: "any_password",
      },
    };
    validatorsSpy.isValid = false;

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("email"));
  });

  test("Should throw if no httpRequest is provided", async () => {
    const { sut } = makeSut();

    await expect(sut.route()).rejects.toThrow();
  });

  test("Should throw if httpRequest has no body", async () => {
    const { sut } = makeSut();
    const httpRequest = {};

    await expect(sut.route(httpRequest)).rejects.toThrow();
  });

  test("Should call validators with correct params", async () => {
    const { sut, validatorsSpy } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        email: "any_email@mail.com",
        password: "any_password",
      },
    };

    await sut.route(httpRequest);
    expect(validatorsSpy.emailValue).toBe("any_email@mail.com");
  });

  test("Should call registerBusinessUseCase with correct params", async () => {
    const { sut, registerBusinessUseCaseSpy } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        email: "any_email@mail.com",
        password: "any_password",
      },
    };

    await sut.route(httpRequest);
    expect(registerBusinessUseCaseSpy.name).toBe("any_name");
    expect(registerBusinessUseCaseSpy.email).toBe("any_email@mail.com");
    expect(registerBusinessUseCaseSpy.password).toBe("any_password");
  });

  test("Should return 201 with created business when input is valid", async () => {
    const { sut, registerBusinessUseCaseSpy } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        email: "any_email@mail.com",
        password: "any_password",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(201);
    expect(httpResponse.body).toEqual(registerBusinessUseCaseSpy.business);
  });

  test("Should throw if invalid dependency is provided", async () => {
    const registerBusinessUseCase = makeRegisterBusinessUseCase();
    const suts = [
      new RegisterBusinessRouter(),
      new RegisterBusinessRouter({}),
      new RegisterBusinessRouter({
        registerBusinessUseCase: {},
      }),
      new RegisterBusinessRouter({
        registerBusinessUseCase,
      }),
      new RegisterBusinessRouter({
        registerBusinessUseCase,
        validators: {},
      }),
    ];

    const httpRequest = {
      body: {
        name: "any_name",
        email: "any_email@mail.com",
        password: "any_password",
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });

  test("Should throw if any dependency throws", async () => {
    const registerBusinessUseCase = makeRegisterBusinessUseCase();
    const suts = [
      new RegisterBusinessRouter({
        registerBusinessUseCase: makeRegisterBusinessUseCaseWithError(),
      }),
      new RegisterBusinessRouter({
        registerBusinessUseCase,
        validators: makeValidatorsWithError(),
      }),
    ];

    const httpRequest = {
      body: {
        name: "any_name",
        email: "any_email@mail.com",
        password: "any_password",
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });
});
