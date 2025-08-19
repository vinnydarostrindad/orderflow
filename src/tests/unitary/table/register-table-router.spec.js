import MissingParamError from "../../../utils/errors/missing-param-error.js";
import RegisterTableRouter from "../../../presentation/routers/table/register-table-router.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";

const makeSut = () => {
  const registerTableUseCaseSpy = makeRegisterTableUseCase();
  const validatorsSpy = makeValidators();
  const sut = new RegisterTableRouter({
    registerTableUseCase: registerTableUseCaseSpy,
    validators: validatorsSpy,
  });
  return { sut, registerTableUseCaseSpy, validatorsSpy };
};

const makeRegisterTableUseCase = () => {
  class RegisterTableUseCaseSpy {
    async execute({ businessId, number, name }) {
      this.businessId = businessId;
      this.number = number;
      this.name = name;
      return this.table;
    }
  }

  const registerTableUseCaseSpy = new RegisterTableUseCaseSpy();
  registerTableUseCaseSpy.table = {
    id: "any_table_id",
    businessId: "any_business_id",
    number: "any_number",
    name: "any_name",
  };
  return registerTableUseCaseSpy;
};

const makeRegisterTableUseCaseWithError = () => {
  class RegisterTableUseCaseSpy {
    async execute() {
      throw new Error();
    }
  }

  return new RegisterTableUseCaseSpy();
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

describe("Register Table Router", () => {
  test("Should return 400 if no number is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      auth: { businessId: "any_business_id" },
      body: { name: "any_name" },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("number"));
  });

  test("Should return 400 if no businessId is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      auth: {},
      body: { number: "any_number", name: "any_name" },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("businessId"));
  });

  test("Should return 400 if businessid is invalid", async () => {
    const { sut, validatorsSpy } = makeSut();
    const httpRequest = {
      auth: { businessId: "invalid_business_id" },
      body: {
        number: "any_number",
        name: "any_name",
      },
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
      auth: { businessId: "any_business_id" },
    };
    await expect(sut.route(httpRequest)).rejects.toThrow();
  });

  test("Should throw if httpRequest has no params", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: { number: "any_number", name: "any_name" },
    };
    await expect(sut.route(httpRequest)).rejects.toThrow();
  });

  test("Should call registerTableUseCase with correct params", async () => {
    const { sut, registerTableUseCaseSpy } = makeSut();
    const httpRequest = {
      auth: { businessId: "any_business_id" },
      body: {
        number: "any_number",
        name: "any_name",
      },
    };
    await sut.route(httpRequest);
    expect(registerTableUseCaseSpy.businessId).toBe("any_business_id");
    expect(registerTableUseCaseSpy.number).toBe("any_number");
    expect(registerTableUseCaseSpy.name).toBe("any_name");
  });

  test("Should return 201 with created table if inputs are valid", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      auth: { businessId: "any_business_id" },
      body: {
        number: "any_number",
        name: "any_name",
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(201);
    expect(httpResponse.body).toEqual({
      id: "any_table_id",
      businessId: "any_business_id",
      number: "any_number",
      name: "any_name",
    });
  });

  test("Should throw if invalid dependency is provided", async () => {
    const suts = [
      new RegisterTableRouter(),
      new RegisterTableRouter({}),
      new RegisterTableRouter({
        registerTableUseCase: {},
      }),
      new RegisterTableRouter({
        registerTableUseCase: makeRegisterTableUseCase(),
        validators: {},
      }),
    ];
    const httpRequest = {
      auth: { businessId: "any_business_id" },
      body: { number: "any_number", name: "any_name" },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });

  test("Should throw if any dependency throws", async () => {
    const suts = [
      new RegisterTableRouter({
        registerTableUseCase: makeRegisterTableUseCaseWithError(),
      }),
      new RegisterTableRouter({
        registerTableUseCase: makeRegisterTableUseCase(),
        validators: makeValidatorsWithError(),
      }),
    ];

    const httpRequest = {
      auth: { businessId: "any_business_id" },
      body: { number: "any_number", name: "any_name" },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });
});
