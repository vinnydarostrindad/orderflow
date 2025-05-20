import RegisterBusinessRouter from "../../presentation/routers/register-business-router";
import MissingParamError from "../../utils/errors/missing-param-error";
import ServerError from "../../utils/errors/server-error.js";

const makeSut = () => {
  const registerBusinessUseCaseSpy = makeRegisterBusinessUseCase();
  const sut = new RegisterBusinessRouter({
    registerBusinessUseCase: registerBusinessUseCaseSpy,
  });

  return {
    sut,
    registerBusinessUseCaseSpy,
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

describe("Register Business Router", () => {
  test("Should return 400 if no name is provided", () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: "any_email@mail.com",
        password: "any_password",
      },
    };
    const httpResponse = sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("name"));
  });

  test("Should return 400 if no email is provided", () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        password: "any_password",
      },
    };
    const httpResponse = sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("email"));
  });

  test("Should return 400 if no password is provided", () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        email: "any_email@mail.com",
      },
    };
    const httpResponse = sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("password"));
  });

  test("Should return 400 if no business is registered", () => {
    const { sut, registerBusinessUseCaseSpy } = makeSut();
    registerBusinessUseCaseSpy.user = null;
    const httpRequest = {
      body: {
        name: "any_name",
        email: "any_email@mail.com",
        password: "any_password",
      },
    };
    const httpResponse = sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toBeUndefined();
  });

  test("Should return 500 if no httpRequest is provided", () => {
    const { sut } = makeSut();
    const httpRequest = {};
    const httpResponse = sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return 500 if httpRequest has no body", () => {
    const { sut } = makeSut();
    const httpResponse = sut.route();
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return 201 with created business when input is valid", () => {
    const { sut, registerBusinessUseCaseSpy } = makeSut();
    const httpRequest = {
      body: {
        name: "valid_name",
        email: "valid_email@mail.com",
        password: "valid_password",
      },
    };
    const httpResponse = sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(201);
    expect(httpResponse.body).toEqual(registerBusinessUseCaseSpy.user);
  });

  test("Should throw if any dependency throws", () => {
    const suts = [
      new RegisterBusinessRouter(),
      new RegisterBusinessRouter({}),
      new RegisterBusinessRouter({
        registerBusinessUseCase: {},
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
      const httpResponse = sut.route(httpRequest);

      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toEqual(new ServerError());
    }
  });

  test("Should throw if invalid dependency is provided", () => {
    const suts = [
      new RegisterBusinessRouter({
        registerBusinessUseCase: makeRegisterBusinessUseCaseWithError(),
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
      const httpResponse = sut.route(httpRequest);

      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toEqual(new ServerError());
    }
  });
});
