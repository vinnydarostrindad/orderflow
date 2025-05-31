import RegisterBusinessRouter from "../../../presentation/routers/register-business-router.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import ServerError from "../../../utils/errors/server-error.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";

const makeSut = () => {
  const registerBusinessUseCaseSpy = makeRegisterBusinessUseCase();
  const emailValidatorSpy = makeEmailValidator();
  const sut = new RegisterBusinessRouter({
    registerBusinessUseCase: registerBusinessUseCaseSpy,
    emailValidator: emailValidatorSpy,
  });

  return {
    sut,
    registerBusinessUseCaseSpy,
    emailValidatorSpy,
  };
};

const makeRegisterBusinessUseCase = () => {
  class RegisterBusinessUseCaseSpy {
    execute({ name, email, password }) {
      this.name = name;
      this.email = email;
      this.password = password;
      return this.user;
    }
  }

  const registerBusinessUseCaseSpy = new RegisterBusinessUseCaseSpy();
  registerBusinessUseCaseSpy.user = {
    name: "valid_name",
    email: "valid_email@mail.com",
    password: "valid_password",
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

const makeEmailValidator = () => {
  class EmailValidatorSpy {
    execute({ email }) {
      this.email = email;
      return this.isValid;
    }
  }

  const emailValidatorSpy = new EmailValidatorSpy();
  emailValidatorSpy.isValid = true;
  return emailValidatorSpy;
};

const makeEmailValidatorWithError = () => {
  class EmailValidatorSpy {
    execute() {
      throw new Error();
    }
  }

  return new EmailValidatorSpy();
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

  test("Should return 400 if no business is registered", async () => {
    const { sut, registerBusinessUseCaseSpy } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        email: "any_email@mail.com",
        password: "any_password",
      },
    };
    registerBusinessUseCaseSpy.user = null;

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toBeUndefined();
  });

  test("Should return 400 if invalid email is provided", async () => {
    const { sut, emailValidatorSpy } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        email: "invalid_email@mail.com",
        password: "any_password",
      },
    };
    emailValidatorSpy.isValid = false;

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("email"));
  });

  test("Should return 500 if no httpRequest is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {};

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return 500 if httpRequest has no body", async () => {
    const { sut } = makeSut();

    const httpResponse = await sut.route();
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should call registerBusinessUseCase eith correct params", async () => {
    const { sut, registerBusinessUseCaseSpy } = makeSut();
    const httpRequest = {
      body: {
        name: "valid_name",
        email: "valid_email@mail.com",
        password: "valid_password",
      },
    };

    await sut.route(httpRequest);
    expect(registerBusinessUseCaseSpy.name).toBe("valid_name");
    expect(registerBusinessUseCaseSpy.email).toBe("valid_email@mail.com");
    expect(registerBusinessUseCaseSpy.password).toBe("valid_password");
  });

  test("Should return 201 with created business when input is valid", async () => {
    const { sut, registerBusinessUseCaseSpy } = makeSut();
    const httpRequest = {
      body: {
        name: "valid_name",
        email: "valid_email@mail.com",
        password: "valid_password",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(201);
    expect(httpResponse.body).toEqual(registerBusinessUseCaseSpy.user);
  });

  test("Should throw if any dependency throws", async () => {
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
        emailValidator: {},
      }),
    ];

    for (const sut of suts) {
      const httpRequest = {
        body: {
          name: "any_name",
          email: "any_email@mail.com",
          password: "any_password",
        },
      };
      const httpResponse = await sut.route(httpRequest);

      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toEqual(new ServerError());
    }
  });

  test("Should throw if invalid dependency is provided", async () => {
    const registerBusinessUseCase = makeRegisterBusinessUseCase();
    const suts = [
      new RegisterBusinessRouter({
        registerBusinessUseCase: makeRegisterBusinessUseCaseWithError(),
      }),
      new RegisterBusinessRouter({
        registerBusinessUseCase,
        emailValidator: makeEmailValidatorWithError(),
      }),
    ];

    for (const sut of suts) {
      const httpRequest = {
        body: {
          name: "any_name",
          email: "any_email@mail.com",
          password: "any_password",
        },
      };
      const httpResponse = await sut.route(httpRequest);

      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toEqual(new ServerError());
    }
  });
});
