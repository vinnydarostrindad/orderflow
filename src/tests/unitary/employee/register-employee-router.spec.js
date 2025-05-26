import MissingParamError from "../../../utils/errors/missing-param-error.js";
import RegisterEmployeeRouter from "../../../presentation/routers/register-employee-router.js";
import ServerError from "../../../utils/errors/server-error.js";

const makeSut = () => {
  const registerEmployeeUseCaseSpy = makeRegisterEmployeeUseCase();
  const sut = new RegisterEmployeeRouter({
    registerEmployeeUseCase: registerEmployeeUseCaseSpy,
  });
  return {
    sut,
    registerEmployeeUseCaseSpy,
  };
};

const makeRegisterEmployeeUseCase = () => {
  class RegisterEmployeeUseCaseSpy {
    execute({ business_id, name, role, password }) {
      this.business_id = business_id;
      this.name = name;
      this.role = role;
      this.password = password;
      return this.user;
    }
  }

  const registerEmployeeUseCaseSpy = new RegisterEmployeeUseCaseSpy();
  registerEmployeeUseCaseSpy.user = {
    id: "valid_id",
    business_id: "business_id",
    name: "valid_name",
    role: "valid_role",
    password: "valid_hash",
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

describe("Register Employee Router", () => {
  test("Should return 400 if no business_id is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
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
      body: {
        business_id: "business_id",
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
      body: {
        business_id: "business_id",
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
      body: {
        business_id: "business_id",
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
    const httpRequest = {};
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return 500 no entity is returned", async () => {
    const { sut, registerEmployeeUseCaseSpy } = makeSut();
    const httpRequest = {
      body: {
        business_id: "business_id",
        name: "any_name",
        role: "any_role",
        password: "any_password",
      },
    };
    registerEmployeeUseCaseSpy.user = null;

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should call registerEmployeeBusiness with correct params", async () => {
    const { sut, registerEmployeeUseCaseSpy } = makeSut();
    const httpRequest = {
      body: {
        business_id: "business_id",
        name: "any_name",
        role: "any_role",
        password: "any_password",
      },
    };
    await sut.route(httpRequest);
    expect(registerEmployeeUseCaseSpy.business_id).toBe("business_id");
    expect(registerEmployeeUseCaseSpy.name).toBe("any_name");
    expect(registerEmployeeUseCaseSpy.role).toBe("any_role");
    expect(registerEmployeeUseCaseSpy.password).toBe("any_password");
  });

  test("Should return 201 with created employee if inputs are valid", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        business_id: "business_id",
        name: "any_name",
        role: "any_role",
        password: "any_password",
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(201);
    expect(httpResponse.body).toEqual({
      id: "valid_id",
      business_id: "business_id",
      name: "valid_name",
      role: "valid_role",
      password: "valid_hash",
    });
  });

  test("Should throw if any dependency throws", async () => {
    const suts = [
      new RegisterEmployeeRouter(),
      new RegisterEmployeeRouter({}),
      new RegisterEmployeeRouter({
        registerEmployeeUseCase: {},
      }),
    ];

    for (const sut of suts) {
      const httpRequest = {
        body: {
          business_id: "business_id",
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
    const suts = [
      new RegisterEmployeeRouter({
        registerEmployeeUseCase: makeRegisterEmployeeUseCaseWithError(),
      }),
    ];

    for (const sut of suts) {
      const httpRequest = {
        body: {
          business_id: "business_id",
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
