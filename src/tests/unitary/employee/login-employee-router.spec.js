import LoginEmployeeRouter from "../../../presentation/routers/employee/login-employee-router.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const loginEmployeeUseCaseSpy = makeLoginEmployeeUseCase();
  const validatorsSpy = makeValidators();
  const sut = new LoginEmployeeRouter({
    loginEmployeeUseCase: loginEmployeeUseCaseSpy,
    validators: validatorsSpy,
  });
  return {
    sut,
    loginEmployeeUseCaseSpy,
    validatorsSpy,
  };
};

const makeLoginEmployeeUseCase = () => {
  class LoginEmployeeUseCase {
    execute({ name, role, businessId }) {
      this.name = name;
      this.role = role;
      this.businessId = businessId;
      return this.token;
    }
  }

  const loginEmployeeUseCase = new LoginEmployeeUseCase();
  loginEmployeeUseCase.token = "any_token";
  return loginEmployeeUseCase;
};

const makeLoginEmployeeUseCaseWithError = () => {
  class LoginEmployeeRouter {
    execute() {
      throw new Error();
    }
  }

  return new LoginEmployeeRouter();
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

describe("LoginEmployeeRouter", () => {
  test("should return 400 if no name is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        role: "any_role",
        businessId: "any_business_id",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("name"));
  });

  test("should return 400 if no role is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        businessId: "any_business_id",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("role"));
  });

  test("should return 400 if no businessId is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        role: "any_role",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("businessId"));
  });

  test("should return 400 if businessId is invalid", async () => {
    const { sut, validatorsSpy } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        role: "any_role",
        businessId: "invalid_business_id",
      },
    };
    validatorsSpy.isValid = false;

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("businessId"));
  });

  test("should return 200 if inputs are valid", async () => {
    const { sut, loginEmployeeUseCaseSpy } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        role: "any_role",
        businessId: "any_business_id",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(200);
    expect(httpResponse.headers).toEqual({
      "Set-Cookie": "token=any_token; path=/; max-age=57600",
    });
    expect(httpResponse.body).toEqual(loginEmployeeUseCaseSpy.token);
  });

  test("should throw if no httpRequest is provided", async () => {
    const { sut } = makeSut();
    await expect(sut.route()).rejects.toThrow();
  });

  test("should call loginEmployeeUseCase with correct values", async () => {
    const { sut, loginEmployeeUseCaseSpy } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        role: "any_role",
        businessId: "any_business_id",
      },
    };

    await sut.route(httpRequest);
    const { name, role, businessId } = loginEmployeeUseCaseSpy;
    expect(name).toBe("any_name");
    expect(role).toBe("any_role");
    expect(businessId).toBe("any_business_id");
  });

  test("should call validators with correct values", async () => {
    const { sut, validatorsSpy } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
        role: "any_role",
        businessId: "any_business_id",
      },
    };

    await sut.route(httpRequest);
    expect(validatorsSpy.uuidValue).toBe("any_business_id");
  });

  test("Should throw if invalid dependency is provided", async () => {
    const loginEmployeeUseCase = makeLoginEmployeeUseCase();
    const suts = [
      new LoginEmployeeRouter(),
      new LoginEmployeeRouter({}),
      new LoginEmployeeRouter({
        loginEmployeeUseCase,
      }),
      new LoginEmployeeRouter({
        loginEmployeeUseCase,
        validator: {},
      }),
    ];

    const httpRequest = {
      body: {
        name: "any_name",
        role: "any_role",
        businessId: "any_business_id",
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if any dependency throws", async () => {
    const loginEmployeeUseCase = makeLoginEmployeeUseCase();
    const suts = [
      new LoginEmployeeRouter({
        loginEmployeeUseCase: makeLoginEmployeeUseCaseWithError(),
        validators: makeValidators(),
      }),
      new LoginEmployeeRouter({
        loginEmployeeUseCase,
        validators: makeValidatorsWithError(),
      }),
    ];

    const httpRequest = {
      body: {
        name: "any_name",
        role: "any_role",
        businessId: "any_business_id",
      },
    };

    for (const sut of suts) {
      console.log("UM");
      console.log(sut);
      await expect(sut.route(httpRequest)).rejects.toMatchObject({
        name: "Error",
      });
    }
  });
});
