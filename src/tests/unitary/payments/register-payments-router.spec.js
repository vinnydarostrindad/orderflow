import RegisterPaymentsRouter from "../../../presentation/routers/payments/register-payments-router.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";

const makeSut = () => {
  const registerPaymentsUseCaseSpy = makeRegisterPaymentUseCase();
  const validatorsSpy = makeValidators();
  const sut = new RegisterPaymentsRouter({
    registerPaymentsUseCase: registerPaymentsUseCaseSpy,
    validators: validatorsSpy,
  });

  return {
    sut,
    registerPaymentsUseCaseSpy,
    validatorsSpy,
  };
};

const makeRegisterPaymentUseCase = () => {
  class RegisterPaymentsUseCaseSpy {
    async execute({ tableSessionId, method, amount }) {
      this.tableSessionId = tableSessionId;
      this.method = method;
      this.amount = amount;
      return this.payment;
    }
  }

  const registerPaymentsUseCaseSpy = new RegisterPaymentsUseCaseSpy();
  registerPaymentsUseCaseSpy.payment = {
    id: "any_id",
    table_session_id: "any_table_session_id",
    method: "pix",
    amount: 100,
    status: "completed",
  };

  return registerPaymentsUseCaseSpy;
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

describe("Registers Payments Router", () => {
  test("Should call registerPaymentsUseCase with correct values", async () => {
    const { sut, registerPaymentsUseCaseSpy } = makeSut();

    const httpRequest = {
      params: { tableSessionId: "any_table_session_id" },
      body: {
        method: "pix",
        amount: 100,
      },
    };

    await sut.route(httpRequest);

    expect(registerPaymentsUseCaseSpy.tableSessionId).toBe(
      "any_table_session_id",
    );
    expect(registerPaymentsUseCaseSpy.method).toBe("pix");
    expect(registerPaymentsUseCaseSpy.amount).toBe(100);
  });

  test("Should return 201 with created payment", async () => {
    const { sut } = makeSut();

    const httpRequest = {
      params: { tableSessionId: "any_table_session_id" },
      body: {
        method: "pix",
        amount: 100,
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(201);
    expect(httpResponse.body).toEqual({
      id: "any_id",
      tableSessionId: "any_table_session_id",
      method: "pix",
      amount: 100,
      status: "completed",
      createdAt: undefined,
      updatedAt: undefined,
    });
  });

  test("Should return 400 if no tableSessionId is provided", async () => {
    const { sut } = makeSut();

    const httpRequest = {
      params: {},
      body: {
        method: "pix",
        amount: 100,
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("tableSessionId"));
  });

  test("Should return 400 if tableSessionId is invalid", async () => {
    const { sut, validatorsSpy } = makeSut();

    const httpRequest = {
      params: { tableSessionId: "invalid_table_session_id" },
      body: {
        method: "pix",
        amount: 100,
      },
    };

    validatorsSpy.isValid = false;

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("tableSessionId"));
  });

  test("Should return 400 if no method is provided", async () => {
    const { sut } = makeSut();

    const httpRequest = {
      params: { tableSessionId: "valid_table_session_id" },
      body: {
        amount: 100,
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("method"));
  });

  test("Should return 400 if no amount is provided", async () => {
    const { sut } = makeSut();

    const httpRequest = {
      params: { tableSessionId: "valid_table_session_id" },
      body: {
        method: "pix",
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("amount"));
  });

  test("Should throw if no httpRequest is provided", async () => {
    const { sut } = makeSut();

    await expect(sut.route()).rejects.toThrow();
  });

  test("Should throw if no httpRequest has no params", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        method: "pix",
        amount: 100,
      },
    };

    await expect(sut.route(httpRequest)).rejects.toThrow();
  });

  test("Should throw if no httpRequest has no body", async () => {
    const { sut } = makeSut();
    const httpRequest = { params: { tableSessionId: "any_table_session_id" } };

    await expect(sut.route(httpRequest)).rejects.toThrow();
  });

  test("Should throw if dependency is invalid", async () => {
    const suts = [
      new RegisterPaymentsRouter(),
      new RegisterPaymentsRouter({}),
      new RegisterPaymentsRouter({ registerPaymentsUseCase: {} }),
      new RegisterPaymentsRouter({
        registerPaymentsUseCase: makeRegisterPaymentUseCase(),
        validators: {},
      }),
    ];

    const httpRequest = {
      params: { tableSessionId: "any_table_session_id" },
      body: {
        method: "pix",
        amount: 100,
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });

  test("Should throw if dependency throws", async () => {
    const suts = [
      new RegisterPaymentsRouter({
        registerPaymentsUseCase: {
          execute() {
            throw new Error();
          },
        },
        validators: makeValidators(),
      }),
      new RegisterPaymentsRouter({
        registerPaymentsUseCase: makeRegisterPaymentUseCase(),
        validators: makeValidatorsWithError(),
      }),
    ];

    const httpRequest = {
      params: { tableSessionId: "any_table_session_id" },
      body: {
        method: "pix",
        amount: 100,
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });
});
