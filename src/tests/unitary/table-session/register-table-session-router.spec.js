import RegisterTableSessionRouter from "../../../presentation/routers/table-session/register-table-session-router.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const registerTableSessionUseCaseSpy = makeRegisterTableSessionUseCase();
  const validatorsSpy = makeValidators();
  const sut = new RegisterTableSessionRouter({
    registerTableSessionUseCase: registerTableSessionUseCaseSpy,
    validators: validatorsSpy,
  });

  return { sut, registerTableSessionUseCaseSpy, validatorsSpy };
};

const makeRegisterTableSessionUseCase = () => {
  class RegisterTableSessionUseCaseSpy {
    async execute({ tableId, name }) {
      this.tableId = tableId;
      this.name = name;
      return this.tableSession;
    }
  }

  const registerTableSessionUseCaseSpy = new RegisterTableSessionUseCaseSpy();
  registerTableSessionUseCaseSpy.tableSession = {
    id: "any_table_session_id",
    table_id: "any_table_id",
    name: "any_name",
    status: "open",
    opened_at: "any_opened_at",
    closed_at: null,
  };

  return registerTableSessionUseCaseSpy;
};

const makeRegisterTableSessionUseCaseWithError = () => {
  class RegisterTableSessionUseCaseSpy {
    async execute() {
      throw new Error();
    }
  }

  return new RegisterTableSessionUseCaseSpy();
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

describe("Register Table Session Router", () => {
  test("Should return 400 if no tableId is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: "any_name",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("tableId"));
  });

  test("Should return 400 if tableId is invalid", async () => {
    const { sut, validatorsSpy } = makeSut();
    const httpRequest = {
      body: {
        tableId: "invalid_table_id",
        name: "any_name",
      },
    };

    validatorsSpy.isValid = false;

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("tableId"));
  });

  test("Should return 400 if no httpRequest is provided", async () => {
    const { sut } = makeSut();

    await expect(sut.route()).rejects.toThrow();
  });

  test("Should return 400 if httpRequest has no body", async () => {
    const { sut } = makeSut();
    const httpRequest = {};

    await expect(sut.route(httpRequest)).rejects.toThrow();
  });

  test("Should return 400 if body has no params", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {},
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("tableId"));
  });

  test("Should call registerTableSessionUseCase with correct params", async () => {
    const { sut, registerTableSessionUseCaseSpy } = makeSut();
    const httpRequest = {
      body: {
        tableId: "valid_table_id",
        name: "any_name",
      },
    };

    await sut.route(httpRequest);
    expect(registerTableSessionUseCaseSpy.tableId).toBe(
      httpRequest.body.tableId,
    );
    expect(registerTableSessionUseCaseSpy.name).toBe(httpRequest.body.name);
  });

  test("Should return 201 with created table session if inputs are valid", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        tableId: "valid_table_id",
        name: "any_name",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(201);
    expect(httpResponse.body).toEqual({
      id: "any_table_session_id",
      tableId: "any_table_id",
      name: "any_name",
      status: "open",
      openedAt: "any_opened_at",
      closedAt: null,
    });
  });

  test("Should throw if invalid dependency is provided", async () => {
    const suts = [
      new RegisterTableSessionRouter(),
      new RegisterTableSessionRouter({}),
      new RegisterTableSessionRouter({ registerTableSessionUseCase: {} }),
      new RegisterTableSessionRouter({
        registerTableSessionUseCase: makeRegisterTableSessionUseCase(),
        validators: {},
      }),
    ];

    const httpRequest = {
      body: {
        tableId: "valid_table_id",
        name: "any_name",
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });

  test("Should throw if registerTableSessionUseCase throws", async () => {
    const suts = [
      new RegisterTableSessionRouter({
        registerTableSessionUseCase: makeRegisterTableSessionUseCaseWithError(),
      }),
      new RegisterTableSessionRouter({
        registerTableSessionUseCase: makeRegisterTableSessionUseCase(),
        validators: makeValidatorsWithError(),
      }),
    ];

    const httpRequest = {
      body: {
        tableId: "valid_table_id",
        name: "any_name",
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });
});
