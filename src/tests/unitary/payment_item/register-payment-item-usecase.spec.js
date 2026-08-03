import RegisterPaymentItemUseCase from "../../../domain/usecase/payment_item/register-payment-item-usecase.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const idGeneratorSpy = makeIdGenerator();
  const paymentItemRepositorySpy = makePaymentItemRepository();
  const sut = new RegisterPaymentItemUseCase({
    idGenerator: idGeneratorSpy,
    paymentItemRepository: paymentItemRepositorySpy,
  });

  return { sut, idGeneratorSpy, paymentItemRepositorySpy };
};

const makeIdGenerator = () => {
  const idGeneratorSpy = {
    execute() {
      return this.id;
    },
  };

  idGeneratorSpy.id = "any_payment_item_id";

  return idGeneratorSpy;
};

const makeIdGeneratorWithError = () => {
  return {
    execute() {
      throw new Error();
    },
  };
};

const makePaymentItemRepository = () => {
  class PaymentItemRepositorySpy {
    async create({ id, paymentId, orderItemId, quantity, amount }) {
      this.id = id;
      this.paymentId = paymentId;
      this.orderItemId = orderItemId;
      this.quantity = quantity;
      this.amount = amount;
      return this.paymentItem;
    }
  }

  const paymentItemRepositorySpy = new PaymentItemRepositorySpy();
  paymentItemRepositorySpy.paymentItem = {
    id: "any_payment_item_id",
    payment_id: "any_payment_id",
    order_item_id: "any_order_item_id",
    quantity: 1,
    amount: 20,
  };

  return paymentItemRepositorySpy;
};

const makePaymentItemRepositoryWithError = () => {
  class PaymentItemRepositorySpy {
    create() {
      throw new Error();
    }
  }

  return new PaymentItemRepositorySpy();
};

describe("Register Payment Item UseCase", () => {
  test("Should return payment item if everything is right", async () => {
    const { sut } = makeSut();
    const props = {
      paymentId: "any_payment_id",
      orderItemId: "any_order_item_id",
      quantity: 1,
      amount: 20,
    };

    const paymentItem = await sut.execute(props);

    expect(paymentItem).toEqual({
      id: "any_payment_item_id",
      payment_id: "any_payment_id",
      order_item_id: "any_order_item_id",
      quantity: 1,
      amount: 20,
    });
  });

  test("Should throw if no props are provided", async () => {
    const { sut } = makeSut();

    await expect(sut.execute()).rejects.toThrow(
      new MissingParamError("paymentId"),
    );
  });

  test("Should throw if no paymentId is provided", async () => {
    const { sut } = makeSut();
    const props = {
      orderItemId: "any_order_item_id",
      quantity: 1,
      amount: 20,
    };

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("paymentId"),
    );
  });

  test("Should throw if no orderItemId is provided", async () => {
    const { sut } = makeSut();
    const props = {
      paymentId: "any_payment_id",
      quantity: 1,
      amount: 20,
    };

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("orderItemId"),
    );
  });

  test("Should throw if no quantity is provided", async () => {
    const { sut } = makeSut();
    const props = {
      paymentId: "any_payment_id",
      orderItemId: "any_order_item_id",
      amount: 20,
    };

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("quantity"),
    );
  });

  test("Should throw if no amount is provided", async () => {
    const { sut } = makeSut();
    const props = {
      paymentId: "any_payment_id",
      orderItemId: "any_order_item_id",
      quantity: 1,
    };

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("amount"),
    );
  });

  test("Should call paymentItemRepository with correct values", async () => {
    const { sut, paymentItemRepositorySpy, idGeneratorSpy } = makeSut();
    const props = {
      paymentId: "any_payment_id",
      orderItemId: "any_order_item_id",
      quantity: 1,
      amount: 20,
    };

    await sut.execute(props);

    expect(paymentItemRepositorySpy.id).toBe(idGeneratorSpy.id);
    expect(paymentItemRepositorySpy.paymentId).toBe("any_payment_id");
    expect(paymentItemRepositorySpy.orderItemId).toBe("any_order_item_id");
    expect(paymentItemRepositorySpy.quantity).toBe(1);
    expect(paymentItemRepositorySpy.amount).toBe(20);
  });

  test("Should throw if invalid dependencies are provided", async () => {
    const idGenerator = makeIdGenerator();
    const suts = [
      new RegisterPaymentItemUseCase(),
      new RegisterPaymentItemUseCase({}),
      new RegisterPaymentItemUseCase({ idGenerator: {} }),
      new RegisterPaymentItemUseCase({ idGenerator }),
      new RegisterPaymentItemUseCase({
        idGenerator,
        paymentItemRepository: {},
      }),
    ];

    const props = {
      paymentId: "any_payment_id",
      orderItemId: "any_order_item_id",
      quantity: 1,
      amount: 20,
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if any dependency throws", async () => {
    const idGenerator = makeIdGenerator();
    const suts = [
      new RegisterPaymentItemUseCase({
        idGenerator: makeIdGeneratorWithError(),
      }),
      new RegisterPaymentItemUseCase({
        idGenerator,
        paymentItemRepository: makePaymentItemRepositoryWithError(),
      }),
    ];

    const props = {
      paymentId: "any_payment_id",
      orderItemId: "any_order_item_id",
      quantity: 1,
      amount: 20,
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow();
    }
  });
});
