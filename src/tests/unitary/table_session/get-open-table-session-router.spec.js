import MissingParamError from "../../../utils/errors/missing-param-error.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import NotFoundError from "../../../utils/errors/not-found-error.js";
import GetOpenTableSessionRouter from "../../../presentation/routers/table_session/get-open-table-session-router.js";

const makeSut = () => {
  const getOpenTableSessionUseCaseSpy = makeGetOpenTableSessionUseCase();
  const validatorsSpy = makeValidators();
  const sut = new GetOpenTableSessionRouter({
    getOpenTableSessionUseCase: getOpenTableSessionUseCaseSpy,
    validators: validatorsSpy,
  });
  return { sut, getOpenTableSessionUseCaseSpy, validatorsSpy };
};

const makeGetOpenTableSessionUseCase = () => {
  class GetOpenTableSessionUseCaseSpy {
    async execute({ tableId }) {
      this.tableId = tableId;
      return this.tableSession;
    }
  }

  const getOpenTableSessionUseCaseSpy = new GetOpenTableSessionUseCaseSpy();
  getOpenTableSessionUseCaseSpy.tableSession = {
    id: "any_table_session_id",
    table_id: "any_table_id",
    name: "any_name",
    status: "open",
    opened_at: "any_opened_at",
    closed_at: null,
  };

  return getOpenTableSessionUseCaseSpy;
};

const makeGetOpenTableSessionUseCaseWithError = () => {
  class GetOpenTableSessionUseCaseSpy {
    async execute() {
      throw new Error();
    }
  }

  return new GetOpenTableSessionUseCaseSpy();
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

describe("Get Open Table Session Router", () => {
  test("Should return 400 if no tableId is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      query: {},
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("tableId"));
  });

  test("Should return 400 if tableId is invalid", async () => {
    const { sut, validatorsSpy } = makeSut();
    const httpRequest = {
      query: {
        tableId: "invalid_table_id",
      },
    };

    validatorsSpy.isValid = false;

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("tableId"));
  });

  test("Should call getOpenTableSessionUseCase with correct params", async () => {
    const { sut, getOpenTableSessionUseCaseSpy } = makeSut();
    const httpRequest = {
      query: {
        tableId: "valid_table_id",
      },
    };

    await sut.route(httpRequest);
    expect(getOpenTableSessionUseCaseSpy.tableId).toBe(
      httpRequest.query.tableId,
    );
  });

  test("Should return 200 with open table session if exists", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      query: {
        tableId: "valid_table_id",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(200);
    expect(httpResponse.body).toEqual({
      id: "any_table_session_id",
      tableId: "any_table_id",
      name: "any_name",
      status: "open",
      openedAt: "any_opened_at",
      closedAt: null,
    });
  });

  test("Should return 404 if no open session is found", async () => {
    const { sut, getOpenTableSessionUseCaseSpy } = makeSut();
    const httpRequest = {
      query: {
        tableId: "valid_table_id",
      },
    };

    getOpenTableSessionUseCaseSpy.tableSession = null;

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(404);
    expect(httpResponse.body).toEqual(
      new NotFoundError({
        resource: "TableSession",
        action: "Make sure the session is open.",
      }),
    );
  });

  test("Should throw if invalid dependency is provided", async () => {
    const suts = [
      new GetOpenTableSessionRouter(),
      new GetOpenTableSessionRouter({}),
      new GetOpenTableSessionRouter({ getOpenTableSessionUseCase: {} }),
      new GetOpenTableSessionRouter({
        getOpenTableSessionUseCase: makeGetOpenTableSessionUseCase(),
        validators: {},
      }),
    ];

    const httpRequest = {
      query: {
        tableId: "valid_table_id",
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });

  test("Should throw if getOpenTableSessionUseCase throws", async () => {
    const suts = [
      new GetOpenTableSessionRouter({
        getOpenTableSessionUseCase: makeGetOpenTableSessionUseCaseWithError(),
      }),
      new GetOpenTableSessionRouter({
        getOpenTableSessionUseCase: makeGetOpenTableSessionUseCase(),
        validators: makeValidatorsWithError(),
      }),
    ];

    const httpRequest = {
      query: {
        tableId: "valid_table_id",
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });
});
