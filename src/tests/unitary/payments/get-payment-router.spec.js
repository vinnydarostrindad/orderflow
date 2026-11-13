import GetPaymentsRouter from "../../../presentation/routers/payments/get-payments-router.js";
import NotFoundError from "../../../utils/errors/not-found-error.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const getPaymentUseCaseSpy = makeGetPaymentUseCase();
  const validatorsSpy = makeValidators();
  const sut = new GetPaymentsRouter({
    getPaymentUseCase: getPaymentUseCaseSpy,
    validators: validatorsSpy,
  });
  return { sut, getPaymentUseCaseSpy, validatorsSpy };
};

const makeGetPaymentUseCase = () => {
  class GetPaymentUseCaseSpy {
    async execute({ paymentId, tableSessionId, businessId }) {
      this.businessId = businessId;
      this.tableSessionId = tableSessionId;
      if (!paymentId) {
        return this.payments;
      }

      this.paymentId = paymentId;
      return this.payment;
    }
  }

  const getPaymentUseCaseSpy = new GetPaymentUseCaseSpy();
  getPaymentUseCaseSpy.payment = {
    id: "any_payment_id",
    table_session_id: "any_table_session_id",
    method: "pix",
    amount: 100,
    status: "complete",
  };
  getPaymentUseCaseSpy.payments = [
    {
      id: "any_payment_id",
      table_session_id: "any_table_session_id",
      method: "pix",
      amount: 100,
      status: "complete",
    },
  ];
  return getPaymentUseCaseSpy;
};

const makeGetPaymentUseCaseWithError = () => {
  class GetPaymentUseCaseSpy {
    execute() {
      throw new Error();
    }
  }

  return new GetPaymentUseCaseSpy();
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

describe("Get Payments Router", () => {
  describe("With businessId", () => {
    test("Should return 400 if no businessId is provided", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: {},
        auth: {},
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(400);
      expect(httpResponse.body).toEqual(new MissingParamError("businessId"));
    });

    test("Should return 400 if invalid businessId is provided", async () => {
      const { sut, validatorsSpy } = makeSut();
      const httpRequest = {
        params: {},
        auth: { businessId: "invalid_business_id" },
      };

      validatorsSpy.isValid = false;

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(400);
      expect(httpResponse.body).toEqual(new InvalidParamError("businessId"));
    });

    test("Should call getPaymentUseCase with correct value", async () => {
      const { sut, getPaymentUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {},
        auth: { businessId: "any_business_id" },
      };

      await sut.route(httpRequest);
      expect(getPaymentUseCaseSpy.businessId).toBe("any_business_id");
      expect(getPaymentUseCaseSpy.tableSessionId).toBeUndefined();
      expect(getPaymentUseCaseSpy.id).toBeUndefined();
    });

    test("Should return 200 and a array of payments", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: {},
        auth: { businessId: "any_business_id" },
      };

      const httpResponse = await sut.route(httpRequest);

      expect(httpResponse.statusCode).toBe(200);
      expect(Array.isArray(httpResponse.body)).toBeTruthy();
      expect(httpResponse.body[0]).toEqual({
        id: "any_payment_id",
        tableSessionId: "any_table_session_id",
        method: "pix",
        amount: 100,
        status: "complete",
      });
    });
  });

  describe("With tableSessionId", () => {
    test("Should call getPaymentUseCase with correct value", async () => {
      const { sut, getPaymentUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          tableSessionId: "any_table_session_id",
        },
        auth: {
          businessId: "any_business_id",
        },
      };

      await sut.route(httpRequest);
      expect(getPaymentUseCaseSpy.tableSessionId).toBe("any_table_session_id");
      expect(getPaymentUseCaseSpy.businessId).toBeUndefined();
      expect(getPaymentUseCaseSpy.id).toBeUndefined();
    });

    test("Should return 200 and a array of payments", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: {
          tableSessionId: "any_table_session_id",
        },
        auth: {
          businessId: "any_business_id",
        },
      };

      const httpResponse = await sut.route(httpRequest);

      expect(httpResponse.statusCode).toBe(200);
      expect(Array.isArray(httpResponse.body)).toBe(true);
      expect(httpResponse.body[0]).toEqual({
        id: "any_payment_id",
        tableSessionId: "any_table_session_id",
        method: "pix",
        amount: 100,
        status: "complete",
      });
    });
  });

  describe("With tableSessionId and paymentsId", () => {
    test("Should return 400 if id is invalid", async () => {
      const { sut, validatorsSpy } = makeSut();
      const httpRequest = {
        params: {
          tableSessionId: "valid_table_session_id",
          paymentId: "invalid_id",
        },
        auth: {
          businessId: "any_business_id",
        },
      };

      validatorsSpy.isValid = false;

      const httpResponse = await sut.route(httpRequest);

      expect(httpResponse.statusCode).toBe(400);
      expect(httpResponse.body).toEqual(new InvalidParamError("paymentId"));
    });

    test("Should return 404 if no payment is found", async () => {
      const { sut, getPaymentUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          tableSessionId: "any_table_session_id",
          paymentId: "any_payment_id",
        },
        auth: {
          businessId: "any_business_id",
        },
      };
      getPaymentUseCaseSpy.payment = null;

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(404);
      expect(httpResponse.body).toEqual(
        new NotFoundError({ resource: "Payment" }),
      );
    });

    test("Should call getPaymentUseCase with correct value", async () => {
      const { sut, getPaymentUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          tableSessionId: "any_table_session_id",
          paymentId: "any_payment_id",
        },
        auth: {
          businessId: "any_business_id",
        },
      };

      await sut.route(httpRequest);
      expect(getPaymentUseCaseSpy.tableSessionId).toBe("any_table_session_id");
      expect(getPaymentUseCaseSpy.businessId).toBeUndefined();
      expect(getPaymentUseCaseSpy.paymentId).toBe("any_payment_id");
    });

    test("Should return 200 with payment correctly", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: {
          tableSessionId: "any_table_session_id",
          paymentId: "any_payment_id",
        },
        auth: {
          businessId: "any_business_id",
        },
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(200);
      expect(httpResponse.body).toEqual({
        id: "any_payment_id",
        tableSessionId: "any_table_session_id",
        method: "pix",
        amount: 100,
        status: "complete",
      });
    });
  });

  test("Should return 400 if tableSessionId is invalid", async () => {
    const { sut, validatorsSpy } = makeSut();
    const httpRequest = {
      params: {
        tableSessionId: "invalid_table_session_id",
        id: "valid_id",
      },
      auth: {
        businessId: "any_business_id",
      },
      query: {},
    };

    validatorsSpy.isValid = false;

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("tableSessionId"));
  });

  test("Should throw if no httpRequest is provided", async () => {
    const { sut } = makeSut();

    await expect(sut.route()).rejects.toThrow();
  });

  test("Should throw if no httpRequest has no params", async () => {
    const { sut } = makeSut();
    const httpRequest = {};

    await expect(sut.route(httpRequest)).rejects.toThrow();
  });

  test("Should throw if invalid dependency is provided", async () => {
    const suts = [
      new GetPaymentsRouter(),
      new GetPaymentsRouter({}),
      new GetPaymentsRouter({
        getPaymentUseCase: {},
      }),
      new GetPaymentsRouter({
        getPaymentUseCase: makeGetPaymentUseCase(),
        validators: {},
      }),
    ];

    const httpRequest = {
      params: {
        tableSessionId: "any_table_session_id",
        paymentId: "any_payment_id",
      },
      auth: {
        businessId: "any_business_id",
      },
      query: {},
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });

  test("Should throw if dependency throws", async () => {
    const suts = [
      new GetPaymentsRouter({
        getPaymentUseCase: makeGetPaymentUseCaseWithError(),
      }),
      new GetPaymentsRouter({
        getPaymentUseCase: makeGetPaymentUseCase(),
        validators: makeValidatorsWithError(),
      }),
    ];

    const httpRequest = {
      params: {
        tableSessionId: "any_table_session_id",
        paymentId: "any_payment_id",
      },
      auth: {
        businessId: "any_business_id",
      },
      query: {},
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });
});
