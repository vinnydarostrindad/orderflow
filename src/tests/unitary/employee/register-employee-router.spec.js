import MissingParamError from "../../../utils/errors/missing-param-error.js";
import RegisterEmployeeRouter from "../../../presentation/routers/employee/register-employee-router.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";

const makeSut = () => {
  const registerEmployeeUseCaseSpy = makeRegisterEmployeeUseCase();
  const validatorsSpy = makeValidators();
  const sut = new RegisterEmployeeRouter({
    registerEmployeeUseCase: registerEmployeeUseCaseSpy,
    validators: validatorsSpy,
  });
  return {
    sut,
    registerEmployeeUseCaseSpy,
    validatorsSpy,
  };
};

const makeRegisterEmployeeUseCase = () => {
  class RegisterEmployeeUseCaseSpy {
    execute({ businessId, name, role, password }) {
      this.businessId = businessId;
      this.name = name;
      this.role = role;
      this.password = password;
      return this.employee;
    }
  }

  const registerEmployeeUseCaseSpy = new RegisterEmployeeUseCaseSpy();
  registerEmployeeUseCaseSpy.employee = {
    id: "any_id",
    businessId: "any_business_id",
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

const makeValidators = () => {
  const validatorsSpy = {
    uuid(uuidValue) {
      this.uuidValue = uuidValue;
      return this.isValid;
    },
  };

  validatorsSpy.isValid = true;
  return validatorsSpy;
};

const makeValidatorsWithError = () => {
  const validatorsSpy = {
    uuid() {
      throw new Error();
    },
  };

  return validatorsSpy;
};

describe("Register Employee Router", () => {
  test("Should return 400 if no businessId is provided", async () => {
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
    expect(httpResponse.body).toEqual(new MissingParamError("businessId"));
  });

  test("Should return 400 if businessId is invalid", async () => {
    const { sut, validatorsSpy } = makeSut();
    const httpRequest = {
      params: { businessId: "invalid_business_id" },
      body: {
        name: "any_name",
        role: "any_role",
        password: "any_password",
      },
    };

    validatorsSpy.isValid = false;

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("businessId"));
  });

  test("Should return 400 if no name is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { businessId: "any_business_id" },
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
      params: { businessId: "any_business_id" },
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
      params: { businessId: "any_business_id" },
      body: {
        name: "any_name",
        role: "any_role",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("password"));
  });

  test("Should throw if no httpRequest is provided", async () => {
    const { sut } = makeSut();
    await expect(sut.route()).rejects.toThrow();
  });

  test("Should throw if httpRequest has no body", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      paras: { businessId: "any_business_id" },
    };

    await expect(sut.route(httpRequest)).rejects.toThrow();
  });

  test("Should throw if httpRequest has no params", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        role: "any_role",
        password: "any_password",
      },
    };
    await expect(sut.route(httpRequest)).rejects.toThrow();
  });

  test("Should call registerEmployeeBusiness with correct params", async () => {
    const { sut, registerEmployeeUseCaseSpy } = makeSut();
    const httpRequest = {
      params: { businessId: "any_business_id" },
      body: {
        name: "any_name",
        role: "any_role",
        password: "any_password",
      },
    };
    await sut.route(httpRequest);
    expect(registerEmployeeUseCaseSpy.businessId).toBe("any_business_id");
    expect(registerEmployeeUseCaseSpy.name).toBe("any_name");
    expect(registerEmployeeUseCaseSpy.role).toBe("any_role");
    expect(registerEmployeeUseCaseSpy.password).toBe("any_password");
  });

  test("Should return 201 with created employee if inputs are valid", async () => {
    const { sut, registerEmployeeUseCaseSpy } = makeSut();
    const httpRequest = {
      params: { businessId: "any_business_id" },
      body: {
        name: "any_name",
        role: "any_role",
        password: "any_password",
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(201);
    expect(httpResponse.body).toEqual(registerEmployeeUseCaseSpy.employee);
  });

  test("Should throw if invalid dependency is provided", async () => {
    const registerEmployeeUseCase = makeRegisterEmployeeUseCase();
    const suts = [
      new RegisterEmployeeRouter(),
      new RegisterEmployeeRouter({}),
      new RegisterEmployeeRouter({
        registerEmployeeUseCase,
      }),
      new RegisterEmployeeRouter({
        registerEmployeeUseCase,
        validator: {},
      }),
    ];

    for (const sut of suts) {
      const httpRequest = {
        params: { businessId: "any_business_id" },
        body: {
          name: "any_name",
          role: "any_role",
          password: "any_password",
        },
      };

      expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });

  test("Should throw if any dependency throws", async () => {
    const registerEmployeeUseCase = makeRegisterEmployeeUseCase();
    const suts = [
      new RegisterEmployeeRouter({
        registerEmployeeUseCase: makeRegisterEmployeeUseCaseWithError(),
      }),
      new RegisterEmployeeRouter({
        registerEmployeeUseCase,
        validators: makeValidatorsWithError(),
      }),
    ];

    const httpRequest = {
      params: { businessId: "any_business_id" },
      body: {
        name: "any_name",
        role: "any_role",
        password: "any_password",
      },
    };

    for (const sut of suts) {
      expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });
});
