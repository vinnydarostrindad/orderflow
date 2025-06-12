import RegisterBusinessRouter from "../../../presentation/routers/business/register-business-router.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import ServerError from "../../../utils/errors/server-error.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";

const makeSut = () => {
  const registerBusinessUseCaseSpy = makeRegisterBusinessUseCase();
  const emailValidatorSpy = makeEmailValidator();
  const authUseCaseSpy = makeAuthUseCase();
  const sut = new RegisterBusinessRouter({
    registerBusinessUseCase: registerBusinessUseCaseSpy,
    emailValidator: emailValidatorSpy,
    authUseCase: authUseCaseSpy,
  });

  return {
    sut,
    registerBusinessUseCaseSpy,
    emailValidatorSpy,
    authUseCaseSpy,
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

const makeEmailValidator = () => {
  const emailValidatorSpy = {
    execute(email) {
      this.email = email;
      return this.isValid;
    },
  };

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

const makeAuthUseCase = () => {
  class AuthUseCaseSpy {
    generateToken(id) {
      this.id = id;
      return this.token;
    }
  }

  const authUseCaseSpy = new AuthUseCaseSpy();
  authUseCaseSpy.token = "any_token";
  return authUseCaseSpy;
};

const makeAuthUseCaseWithError = () => {
  class AuthUseCaseSpy {
    generateToken() {
      throw new Error();
    }
  }

  const authUseCaseSpy = new AuthUseCaseSpy();
  return authUseCaseSpy;
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
    const { sut, emailValidatorSpy } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        email: "inany_email@mail.com",
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

  test("Should return Error if no business is registered", async () => {
    const { sut, registerBusinessUseCaseSpy } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        email: "any_email@mail.com",
        password: "any_password",
      },
    };
    registerBusinessUseCaseSpy.business = null;

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse).toEqual(new Error());
  });

  test("Should call emailValidator with correct params", async () => {
    const { sut, emailValidatorSpy } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        email: "any_email@mail.com",
        password: "any_password",
      },
    };

    await sut.route(httpRequest);
    expect(emailValidatorSpy.email).toBe("any_email@mail.com");
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

  test("Should call authuseCase with correct params", async () => {
    const { sut, authUseCaseSpy } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        email: "any_email@mail.com",
        password: "any_password",
      },
    };

    await sut.route(httpRequest);
    expect(authUseCaseSpy.id).toBe("any_id");
  });

  test("Should return 201 with created business when input is valid", async () => {
    const { sut, registerBusinessUseCaseSpy, authUseCaseSpy } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        email: "any_email@mail.com",
        password: "any_password",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(201);
    expect(httpResponse.body).toEqual({
      business: registerBusinessUseCaseSpy.business,
      token: authUseCaseSpy.token,
    });
  });

  test("Should return 500 if invalid dependency is provided", async () => {
    const registerBusinessUseCase = makeRegisterBusinessUseCase();
    const emailValidator = makeEmailValidator();
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
      new RegisterBusinessRouter({
        registerBusinessUseCase,
        emailValidator,
        authUseCase: {},
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

  test("Should return 500 if any dependency throws", async () => {
    const registerBusinessUseCase = makeRegisterBusinessUseCase();
    const emailValidator = makeEmailValidator();
    const suts = [
      new RegisterBusinessRouter({
        registerBusinessUseCase: makeRegisterBusinessUseCaseWithError(),
      }),
      new RegisterBusinessRouter({
        registerBusinessUseCase,
        emailValidator: makeEmailValidatorWithError(),
      }),
      new RegisterBusinessRouter({
        registerBusinessUseCase,
        emailValidator,
        authUseCase: makeAuthUseCaseWithError(),
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
