import MissingParamError from "../../../utils/errors/missing-param-error.js";
import RegisterMenuRouter from "../../../presentation/routers/menu/register-menu-router.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";

const makeSut = () => {
  const registerMenuUseCaseSpy = makeRegisterMenuUseCase();
  const validatorsSpy = makeValidators();
  const sut = new RegisterMenuRouter({
    registerMenuUseCase: registerMenuUseCaseSpy,
    validators: validatorsSpy,
  });
  return { sut, registerMenuUseCaseSpy, validatorsSpy };
};

const makeRegisterMenuUseCase = () => {
  class RegisterMenuUseCaseSpy {
    async execute({ businessId, name }) {
      this.businessId = businessId;
      this.name = name;
      return this.menu;
    }
  }

  const registerMenuUseCaseSpy = new RegisterMenuUseCaseSpy();
  registerMenuUseCaseSpy.menu = {
    id: "any_menu_id",
    businessId: "any_business_id",
    name: "any_name",
  };
  return registerMenuUseCaseSpy;
};

const makeRegisterMenuUseCaseWithError = () => {
  class RegisterMenuUseCaseSpy {
    async execute() {
      throw new Error();
    }
  }

  return new RegisterMenuUseCaseSpy();
};

const makeValidators = () => {
  const validatorsSpy = {
    uuid(uuidValue) {
      if (this.isValid === false) {
        return uuidValue.split("_")[0] === "valid" ? true : false;
      }

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

describe("Register Menu Router", () => {
  test("Should return 400 if no name is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { businessId: "any_business_id" },
      body: {},
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("name"));
  });

  test("Should return 400 if no businessId is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: {},
      body: { name: "any_name" },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("businessId"));
  });

  test("Should return 400 if businessId is invalid", async () => {
    const { sut, validatorsSpy } = makeSut();
    const httpRequest = {
      params: { businessId: "invalid_business_id" },
      body: { name: "any_name" },
    };

    validatorsSpy.isValid = false;

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("businessId"));
  });

  test("Should throw if no httpRequest is provided", async () => {
    const { sut } = makeSut();

    await expect(sut.route()).rejects.toThrow();
  });

  test("Should throw if httpRequest has no body", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { businessId: "any_business_id" },
    };

    await expect(sut.route(httpRequest)).rejects.toThrow();
  });

  test("Should throw if httpRequest has no params", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
      },
    };

    await expect(sut.route(httpRequest)).rejects.toThrow();
  });

  test("Should call registerMenuUseCase with correct params", async () => {
    const { sut, registerMenuUseCaseSpy } = makeSut();
    const httpRequest = {
      params: { businessId: "any_business_id" },
      body: {
        name: "any_name",
      },
    };
    await sut.route(httpRequest);
    expect(registerMenuUseCaseSpy.businessId).toBe("any_business_id");
    expect(registerMenuUseCaseSpy.name).toBe("any_name");
  });

  test("Should return 201 with created menu if inputs are valid", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { businessId: "any_business_id" },
      body: {
        name: "any_name",
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(201);
    expect(httpResponse.body).toEqual({
      id: "any_menu_id",
      businessId: "any_business_id",
      name: "any_name",
    });
  });

  test("Should throw if invalid dependency is provided", async () => {
    const suts = [
      new RegisterMenuRouter(),
      new RegisterMenuRouter({}),
      new RegisterMenuRouter({
        registerMenuUseCase: {},
      }),
      new RegisterMenuRouter({
        registerMenuUseCase: makeRegisterMenuUseCase(),
        validators: {},
      }),
    ];
    const httpRequest = {
      params: { businessId: "any_business_id" },
      body: { name: "any_name" },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });

  test("Should throw if any dependency throws", async () => {
    const suts = [
      new RegisterMenuRouter({
        registerMenuUseCase: makeRegisterMenuUseCaseWithError(),
      }),
      new RegisterMenuRouter({
        registerMenuUseCase: makeRegisterMenuUseCase(),
        validators: makeValidatorsWithError(),
      }),
    ];
    const httpRequest = {
      params: { businessId: "any_business_id" },
      body: { name: "any_name" },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });
});
