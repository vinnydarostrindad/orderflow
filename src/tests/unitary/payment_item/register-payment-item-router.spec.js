import RegisterPaymentItemRouter from "../../../presentation/routers/payment_item/register-payment-item-router.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";

const makeSut = () => {
  const registerPaymentItemUseCaseSpy = makeRegisterPaymentItemUseCase();
  const validatorsSpy = makeValidators();
  const sut = new RegisterPaymentItemRouter({
    registerPaymentItemUseCase: registerPaymentItemUseCaseSpy,
    validators: validatorsSpy,
  });

  return { sut, registerPaymentItemUseCaseSpy, validatorsSpy };
};

const makeRegisterPaymentItemUseCase = () => {
  class RegisterPaymentItemUseCaseSpy {
    async execute({ paymentId, orderItemId, quantity, amount }) {
      this.paymentId = paymentId;
      this.orderItemId = orderItemId;
      this.quantity = quantity;
      this.amount = amount;
      return this.paymentItem;
    }
  }

  const registerPaymentItemUseCaseSpy = new RegisterPaymentItemUseCaseSpy();
  registerPaymentItemUseCaseSpy.paymentItem = {
    id: "any_payment_item_id",
    payment_id: "any_payment_id",
    order_item_id: "any_order_item_id",
    quantity: 1,
    amount: 20,
  };

  return registerPaymentItemUseCaseSpy;
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
  return {
    uuid() {
      throw new Error();
    },
  };
};

describe("Register Payment Item Router", () => {
  test("Should call registerPaymentItemUseCase with correct values", async () => {
    const { sut, registerPaymentItemUseCaseSpy } = makeSut();

    const httpRequest = {
      params: { paymentId: "any_payment_id" },
      body: {
        orderItemId: "any_order_item_id",
        quantity: 1,
        amount: 20,
      },
    };

    await sut.route(httpRequest);

    expect(registerPaymentItemUseCaseSpy.paymentId).toBe("any_payment_id");
    expect(registerPaymentItemUseCaseSpy.orderItemId).toBe("any_order_item_id");
    expect(registerPaymentItemUseCaseSpy.quantity).toBe(1);
    expect(registerPaymentItemUseCaseSpy.amount).toBe(20);
  });

  test("Should return 201 with created payment item", async () => {
    const { sut } = makeSut();

    const httpRequest = {
      params: { paymentId: "any_payment_id" },
      body: {
        orderItemId: "any_order_item_id",
        quantity: 1,
        amount: 20,
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(201);
    expect(httpResponse.body).toEqual({
      id: "any_payment_item_id",
      paymentId: "any_payment_id",
      orderItemId: "any_order_item_id",
      quantity: "1",
      amount: 20,
      createdAt: undefined,
      updatedAt: undefined,
    });
  });

  test("Should return 400 if no paymentId is provided", async () => {
    const { sut } = makeSut();

    const httpRequest = {
      params: {},
      body: {
        orderItemId: "any_order_item_id",
        quantity: 1,
        amount: 20,
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("paymentId"));
  });

  test("Should return 400 if paymentId is invalid", async () => {
    const { sut, validatorsSpy } = makeSut();

    const httpRequest = {
      params: { paymentId: "invalid_payment_id" },
      body: {
        orderItemId: "valid_order_item_id",
        quantity: 1,
        amount: 20,
      },
    };

    validatorsSpy.isValid = false;

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("paymentId"));
  });

  test("Should return 400 if no orderItemId is provided", async () => {
    const { sut } = makeSut();

    const httpRequest = {
      params: { paymentId: "valid_payment_id" },
      body: {
        quantity: 1,
        amount: 20,
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("orderItemId"));
  });

  test("Should return 400 if orderItemId is invalid", async () => {
    const { sut, validatorsSpy } = makeSut();

    const httpRequest = {
      params: { paymentId: "valid_payment_id" },
      body: {
        orderItemId: "invalid_order_item_id",
        quantity: 1,
        amount: 20,
      },
    };

    validatorsSpy.isValid = false;

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("orderItemId"));
  });

  test("Should return 400 if no quantity is provided", async () => {
    const { sut } = makeSut();

    const httpRequest = {
      params: { paymentId: "valid_payment_id" },
      body: {
        orderItemId: "any_order_item_id",
        amount: 20,
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("quantity"));
  });

  test("Should return 400 if no amount is provided", async () => {
    const { sut } = makeSut();

    const httpRequest = {
      params: { paymentId: "valid_payment_id" },
      body: {
        orderItemId: "any_order_item_id",
        quantity: 1,
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
        orderItemId: "any_order_item_id",
        quantity: 1,
        amount: 20,
      },
    };

    await expect(sut.route(httpRequest)).rejects.toThrow();
  });

  test("Should throw if no httpRequest has no body", async () => {
    const { sut } = makeSut();
    const httpRequest = { params: { paymentId: "any_payment_id" } };

    await expect(sut.route(httpRequest)).rejects.toThrow();
  });

  test("Should throw if dependency is invalid", async () => {
    const suts = [
      new RegisterPaymentItemRouter(),
      new RegisterPaymentItemRouter({}),
      new RegisterPaymentItemRouter({ registerPaymentItemUseCase: {} }),
      new RegisterPaymentItemRouter({
        registerPaymentItemUseCase: makeRegisterPaymentItemUseCase(),
        validators: {},
      }),
    ];

    const httpRequest = {
      params: { paymentId: "any_payment_id" },
      body: {
        orderItemId: "any_order_item_id",
        quantity: 1,
        amount: 20,
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });

  test("Should throw if dependency throws", async () => {
    const suts = [
      new RegisterPaymentItemRouter({
        registerPaymentItemUseCase: {
          execute() {
            throw new Error();
          },
        },
        validators: makeValidators(),
      }),
      new RegisterPaymentItemRouter({
        registerPaymentItemUseCase: makeRegisterPaymentItemUseCase(),
        validators: makeValidatorsWithError(),
      }),
    ];

    const httpRequest = {
      params: { paymentId: "any_payment_id" },
      body: {
        orderItemId: "any_order_item_id",
        quantity: 1,
        amount: 20,
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });
});
