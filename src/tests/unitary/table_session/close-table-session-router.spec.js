import MissingParamError from "../../../utils/errors/missing-param-error.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import NotFoundError from "../../../utils/errors/not-found-error.js";
import CloseTableSessionRouter from "../../../presentation/routers/table_session/close-table-session-router.js";

const makeSut = () => {
  const closeTableSessionUseCaseSpy = makeCloseTableSessionUseCase();
  const validatorsSpy = makeValidators();
  const sut = new CloseTableSessionRouter({
    closeTableSessionUseCase: closeTableSessionUseCaseSpy,
    validators: validatorsSpy,
  });
  return { sut, closeTableSessionUseCaseSpy, validatorsSpy };
};

const makeCloseTableSessionUseCase = () => {
  class CloseTableSessionUseCaseSpy {
    async execute({ tableSessionId }) {
      this.tableSessionId = tableSessionId;
      return this.tableSession;
    }
  }

  const closeTableSessionUseCaseSpy = new CloseTableSessionUseCaseSpy();
  closeTableSessionUseCaseSpy.tableSession = {
    id: "any_table_session_id",
    table_id: "any_table_id",
    name: "any_name",
    status: "closed",
    opened_at: "any_opened_at",
    closed_at: "any_closed_at",
  };

  return closeTableSessionUseCaseSpy;
};

const makeCloseTableSessionUseCaseWithError = () => {
  class CloseTableSessionUseCaseSpy {
    async execute() {
      throw new Error();
    }
  }

  return new CloseTableSessionUseCaseSpy();
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

describe("Close Table Session Router", () => {
  test("Should return 400 if no tableSessionId is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: {},
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("tableSessionId"));
  });

  test("Should return 400 if tableSessionId is invalid", async () => {
    const { sut, validatorsSpy } = makeSut();
    const httpRequest = {
      params: {
        tableSessionId: "invalid_table_session_id",
      },
    };

    validatorsSpy.isValid = false;

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("tableSessionId"));
  });

  test("Should call closeTableSessionUseCase with correct params", async () => {
    const { sut, closeTableSessionUseCaseSpy } = makeSut();
    const httpRequest = {
      params: {
        tableSessionId: "valid_table_session_id",
      },
    };

    await sut.route(httpRequest);
    expect(closeTableSessionUseCaseSpy.tableSessionId).toBe(
      httpRequest.params.tableSessionId,
    );
  });

  test("Should return 200 with closed table session if inputs are valid", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: {
        tableSessionId: "valid_table_session_id",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(200);
    expect(httpResponse.body).toEqual({
      id: "any_table_session_id",
      tableId: "any_table_id",
      name: "any_name",
      status: "closed",
      openedAt: "any_opened_at",
      closedAt: "any_closed_at",
    });
  });

  test("Should return 404 if no open session is found", async () => {
    const { sut, closeTableSessionUseCaseSpy } = makeSut();
    const httpRequest = {
      params: {
        tableSessionId: "valid_table_session_id",
      },
    };

    closeTableSessionUseCaseSpy.tableSession = null;

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
      new CloseTableSessionRouter(),
      new CloseTableSessionRouter({}),
      new CloseTableSessionRouter({ closeTableSessionUseCase: {} }),
      new CloseTableSessionRouter({
        closeTableSessionUseCase: makeCloseTableSessionUseCase(),
        validators: {},
      }),
    ];

    const httpRequest = {
      params: {
        tableSessionId: "valid_table_session_id",
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });

  test("Should throw if closeTableSessionUseCase throws", async () => {
    const suts = [
      new CloseTableSessionRouter({
        closeTableSessionUseCase: makeCloseTableSessionUseCaseWithError(),
      }),
      new CloseTableSessionRouter({
        closeTableSessionUseCase: makeCloseTableSessionUseCase(),
        validators: makeValidatorsWithError(),
      }),
    ];

    const httpRequest = {
      params: {
        tableSessionId: "valid_table_session_id",
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });
});
