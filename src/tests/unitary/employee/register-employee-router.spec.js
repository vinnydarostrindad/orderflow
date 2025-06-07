import MissingParamError from "../../../utils/errors/missing-param-error.js";
import RegisterEmployeeRouter from "../../../presentation/routers/register-employee-router.js";
import ServerError from "../../../utils/errors/server-error.js";

const makeSut = () => {
  const registerEmployeeUseCaseSpy = makeRegisterEmployeeUseCase();
  const authUseCaseSpy = makeAuthUseCase();
  const sut = new RegisterEmployeeRouter({
    registerEmployeeUseCase: registerEmployeeUseCaseSpy,
    authUseCase: authUseCaseSpy,
  });
  return {
    sut,
    registerEmployeeUseCaseSpy,
    authUseCaseSpy,
  };
};

const makeRegisterEmployeeUseCase = () => {
  class RegisterEmployeeUseCaseSpy {
    execute({ business_id, name, role, password }) {
      this.business_id = business_id;
      this.name = name;
      this.role = role;
      this.password = password;
      return this.employee;
    }
  }

  const registerEmployeeUseCaseSpy = new RegisterEmployeeUseCaseSpy();
  registerEmployeeUseCaseSpy.employee = {
    id: "any_id",
    business_id: "any_business_id",
    name: "any_name",
    role: "any_role",
    password: "any_hash",
  };
  return registerEmployeeUseCaseSpy;
};

const makeRegisterEmployeeUseCaseWithError = () => {
  return class {
    route() {
      throw new Error();
    }
  };
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

describe("Register Employee Router", () => {
  test("Should return 400 if no business_id is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: {},
      body: {
        name: "any_name",
        role: "any_role",
        password: "any_password",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("business_id"));
  });

  test("Should return 400 if no name is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { business_id: "any_business_id" },
      body: {
        role: "any_role",
        password: "any_password",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("name"));
  });

  test("Should return 400 if no role is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { business_id: "any_business_id" },
      body: {
        name: "any_name",
        password: "any_password",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("role"));
  });

  test("Should return 400 if no password is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { business_id: "any_business_id" },
      body: {
        name: "any_name",
        role: "any_role",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("password"));
  });

  test("Should return 500 if no httpRequest is provided", async () => {
    const { sut } = makeSut();
    const httpResponse = await sut.route();
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return 500 if httpRequest has no body", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      paras: { business_id: "any_business_id" },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return 500 if no httpRequest is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        role: "any_role",
        password: "any_password",
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return Error if no employee is returned", async () => {
    const { sut, registerEmployeeUseCaseSpy } = makeSut();
    const httpRequest = {
      params: { business_id: "business_id" },
      body: {
        name: "any_name",
        role: "any_role",
        password: "any_password",
      },
    };
    registerEmployeeUseCaseSpy.employee = null;

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse).toEqual(new Error());
  });

  test("Should call registerEmployeeBusiness with correct params", async () => {
    const { sut, registerEmployeeUseCaseSpy } = makeSut();
    const httpRequest = {
      params: { business_id: "any_business_id" },
      body: {
        name: "any_name",
        role: "any_role",
        password: "any_password",
      },
    };
    await sut.route(httpRequest);
    expect(registerEmployeeUseCaseSpy.business_id).toBe("any_business_id");
    expect(registerEmployeeUseCaseSpy.name).toBe("any_name");
    expect(registerEmployeeUseCaseSpy.role).toBe("any_role");
    expect(registerEmployeeUseCaseSpy.password).toBe("any_password");
  });

  test("Should call authuseCase with correct params", async () => {
    const { sut, authUseCaseSpy } = makeSut();
    const httpRequest = {
      params: { business_id: "any_business_id" },
      body: {
        name: "any_name",
        role: "any_role",
        password: "any_password",
      },
    };

    await sut.route(httpRequest);
    console.log(authUseCaseSpy);
    expect(authUseCaseSpy.id).toBe("any_id");
  });

  test("Should return 201 with created employee if inputs are valid", async () => {
    const { sut, registerEmployeeUseCaseSpy, authUseCaseSpy } = makeSut();
    const httpRequest = {
      params: { business_id: "any_business_id" },
      body: {
        name: "any_name",
        role: "any_role",
        password: "any_password",
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(201);
    expect(httpResponse.body).toEqual({
      employee: registerEmployeeUseCaseSpy.employee,
      token: authUseCaseSpy.token,
    });
  });

  test("Should throw if any dependency throws", async () => {
    const registerEmployeeUseCase = makeRegisterEmployeeUseCase();
    const suts = [
      new RegisterEmployeeRouter(),
      new RegisterEmployeeRouter({}),
      new RegisterEmployeeRouter({
        registerEmployeeUseCase,
        authUseCaseSpy: {},
      }),
    ];

    for (const sut of suts) {
      const httpRequest = {
        params: { business_id: "any_business_id" },
        body: {
          name: "any_name",
          role: "any_role",
          password: "any_password",
        },
      };
      const httpResponse = await sut.route(httpRequest);

      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toEqual(new ServerError());
    }
  });

  test("Should throw if invalid dependency is provided", async () => {
    const registerEmployeeUseCase = makeRegisterEmployeeUseCase;
    const suts = [
      new RegisterEmployeeRouter({
        registerEmployeeUseCase: makeRegisterEmployeeUseCaseWithError(),
      }),
      new RegisterEmployeeRouter({
        registerEmployeeUseCase,
        authUseCase: makeAuthUseCaseWithError(),
      }),
    ];

    for (const sut of suts) {
      const httpRequest = {
        params: { business_id: "any_business_id" },
        body: {
          name: "any_name",
          role: "any_role",
          password: "any_password",
        },
      };
      const httpResponse = await sut.route(httpRequest);

      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toEqual(new ServerError());
    }
  });
});
