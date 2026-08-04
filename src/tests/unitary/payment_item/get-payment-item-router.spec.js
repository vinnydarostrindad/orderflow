import GetPaymentItemRouter from "../../../presentation/routers/payment_item/get-payment-item-router.js";
import NotFoundError from "../../../utils/errors/not-found-error.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const getPaymentItemUseCaseSpy = makeGetPaymentItemUseCase();
  const validatorsSpy = makeValidators();
  const sut = new GetPaymentItemRouter({
    getPaymentItemUseCase: getPaymentItemUseCaseSpy,
    validators: validatorsSpy,
  });
  return { sut, getPaymentItemUseCaseSpy, validatorsSpy };
};

const makeGetPaymentItemUseCase = () => {
  class GetPaymentItemUseCaseSpy {
    async execute({ paymentItemId, paymentId }) {
      this.paymentId = paymentId;
      if (!paymentItemId) {
        return this.payments;
      }

      this.paymentItemId = paymentItemId;
      return this.payment;
    }
  }

  const getPaymentItemUseCaseSpy = new GetPaymentItemUseCaseSpy();
  getPaymentItemUseCaseSpy.payment = {
    id: "any_payment_item_id",
    payment_id: "any_payment_id",
    order_item_id: "any_order_item_id",
    quantity: 1,
    amount: 30,
    created_at: "any_date",
  };
  getPaymentItemUseCaseSpy.payments = [getPaymentItemUseCaseSpy.payment];
  return getPaymentItemUseCaseSpy;
};

const makeGetPaymentItemUseCaseWithError = () => {
  class GetPaymentItemUseCaseSpy {
    execute() {
      throw new Error();
    }
  }

  return new GetPaymentItemUseCaseSpy();
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

describe("Get Payment Item Router", () => {
  describe("With paymentId", () => {
    test("Should return 400 if no paymentId is provided", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: {},
      };

      const httpResponse = await sut.route(httpRequest);

      expect(httpResponse.statusCode).toBe(400);
      expect(httpResponse.body).toEqual(new MissingParamError("paymentId"));
    });

    test("Should return 400 if paymentId is invalid", async () => {
      const { sut, validatorsSpy } = makeSut();
      const httpRequest = {
        params: {
          paymentId: "invalid_payment_id",
        },
      };

      validatorsSpy.isValid = false;

      const httpResponse = await sut.route(httpRequest);

      expect(httpResponse.statusCode).toBe(400);
      expect(httpResponse.body).toEqual(new InvalidParamError("paymentId"));
    });

    test("Should call getPaymentItemUseCase with correct value", async () => {
      const { sut, getPaymentItemUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          paymentId: "any_payment_id",
        },
      };

      await sut.route(httpRequest);
      expect(getPaymentItemUseCaseSpy.paymentId).toBe("any_payment_id");
      expect(getPaymentItemUseCaseSpy.paymentItemId).toBeUndefined();
    });

    test("Should return 200 and a array of payments", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: {
          paymentId: "any_payment_id",
        },
      };

      const httpResponse = await sut.route(httpRequest);

      expect(httpResponse.statusCode).toBe(200);
      expect(Array.isArray(httpResponse.body)).toBe(true);
      expect(httpResponse.body[0]).toEqual({
        id: "any_payment_item_id",
        paymentId: "any_payment_id",
        orderItemId: "any_order_item_id",
        quantity: 1,
        amount: 30,
        created_at: "any_date",
      });
    });
  });

  describe("With paymentId and paymentItemId", () => {
    test("Should return 400 if id is invalid", async () => {
      const { sut, validatorsSpy } = makeSut();
      const httpRequest = {
        params: {
          paymentId: "valid_payment_id",
          paymentItemId: "invalid_id",
        },
      };

      validatorsSpy.isValid = false;

      const httpResponse = await sut.route(httpRequest);

      expect(httpResponse.statusCode).toBe(400);
      expect(httpResponse.body).toEqual(new InvalidParamError("paymentItemId"));
    });

    test("Should return 404 if no payment is found", async () => {
      const { sut, getPaymentItemUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          paymentId: "any_payment_id",
          paymentItemId: "any_payment_id",
        },
      };
      getPaymentItemUseCaseSpy.payment = null;

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(404);
      expect(httpResponse.body).toEqual(
        new NotFoundError({ resource: "Payment" }),
      );
    });

    test("Should call getPaymentItemUseCase with correct value", async () => {
      const { sut, getPaymentItemUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          paymentId: "any_payment_id",
          paymentItemId: "any_payment_id",
        },
      };

      await sut.route(httpRequest);
      expect(getPaymentItemUseCaseSpy.paymentId).toBe("any_payment_id");
      expect(getPaymentItemUseCaseSpy.paymentItemId).toBe("any_payment_id");
    });

    test("Should return 200 with payment correctly", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: {
          paymentId: "any_payment_id",
          paymentItemId: "any_payment_id",
        },
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(200);
      expect(httpResponse.body).toEqual({
        id: "any_payment_item_id",
        paymentId: "any_payment_id",
        orderItemId: "any_order_item_id",
        quantity: 1,
        amount: 30,
        created_at: "any_date",
      });
    });
  });

  test("Should return 400 if paymentId is invalid", async () => {
    const { sut, validatorsSpy } = makeSut();
    const httpRequest = {
      params: {
        paymentId: "invalid_payment_id",
        paymentItemId: "valid_id",
      },
    };

    validatorsSpy.isValid = false;

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("paymentId"));
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
      new GetPaymentItemRouter(),
      new GetPaymentItemRouter({}),
      new GetPaymentItemRouter({
        getPaymentUseCase: {},
      }),
      new GetPaymentItemRouter({
        getPaymentUseCase: makeGetPaymentItemUseCase(),
        validators: {},
      }),
    ];

    const httpRequest = {
      params: {
        paymentId: "any_payment_id",
        paymentItemId: "any_payment_id",
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });

  test("Should throw if dependency throws", async () => {
    const suts = [
      new GetPaymentItemRouter({
        getPaymentUseCase: makeGetPaymentItemUseCaseWithError(),
      }),
      new GetPaymentItemRouter({
        getPaymentUseCase: makeGetPaymentItemUseCase(),
        validators: makeValidatorsWithError(),
      }),
    ];

    const httpRequest = {
      params: {
        paymentId: "any_payment_id",
        paymentItemId: "any_payment_id",
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });
});
