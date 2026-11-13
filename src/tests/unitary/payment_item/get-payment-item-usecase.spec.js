import GetPaymentItemUseCase from "../../../domain/usecase/payment_item/get-payment-item-usecase.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const paymentItemRepositorySpy = makePaymentItemRepository();
  const sut = new GetPaymentItemUseCase({
    paymentItemRepository: paymentItemRepositorySpy,
  });
  return {
    sut,
    paymentItemRepositorySpy,
  };
};

const makePaymentItemRepository = () => {
  class PaymentItemRepositorySpy {
    async findAllByPaymentId(paymentId) {
      this.paymentId = paymentId;
      return this.paymentItems;
    }

    async findById(paymentId, paymentItemId) {
      this.paymentId = paymentId;
      this.paymentItemId = paymentItemId;
      return this.paymentItem;
    }
  }

  const paymentItemRepositorySpy = new PaymentItemRepositorySpy();
  paymentItemRepositorySpy.paymentItem = {
    id: "any_payment_item_id",
    payment_id: "any_payment_id",
    order_item_id: "any_order_item_id",
    quantity: 1,
    amount: 30,
    created_at: "any_date",
  };
  paymentItemRepositorySpy.paymentItems = [
    paymentItemRepositorySpy.paymentItem,
  ];
  return paymentItemRepositorySpy;
};

const makePaymentItemRepositoryWithError = () => {
  class paymentItemRepositorySpy {
    findById() {
      throw new Error();
    }
    findAllByPaymentId() {
      throw new Error();
    }
  }

  return new paymentItemRepositorySpy();
};

describe("Get Payment Items Usecase", () => {
  describe("With paymentId", () => {
    test("Should throw if no paymentId is provided", async () => {
      const { sut } = makeSut();

      await expect(sut.execute()).rejects.toThrow(
        new MissingParamError("paymentId"),
      );
    });

    test("Should call paymentItemRepository.findAllByPaymentId with correct value", async () => {
      const { sut, paymentItemRepositorySpy } = makeSut();

      await sut.execute({ paymentId: "payment_id" });
      expect(paymentItemRepositorySpy.paymentId).toBe("payment_id");
      expect(paymentItemRepositorySpy.paymentItemId).toBeUndefined();
    });

    test("Should return an array of payments", async () => {
      const { sut } = makeSut();

      const paymentItems = await sut.execute({ paymentId: "any_payment_id" });
      expect(Array.isArray(paymentItems)).toBe(true);
      expect(paymentItems[0]).toEqual({
        id: "any_payment_item_id",
        payment_id: "any_payment_id",
        order_item_id: "any_order_item_id",
        quantity: 1,
        amount: 30,
        created_at: "any_date",
      });
    });
  });

  describe("With paymentItemId", () => {
    test("Should return null if payment is invalid", async () => {
      const { sut, paymentItemRepositorySpy } = makeSut();
      paymentItemRepositorySpy.paymentItem = null;

      const payment = await sut.execute({
        paymentId: "any_payment_id",
        paymentItemId: "any_payment_item_id",
      });
      expect(payment).toBeNull();
    });

    test("Should call paymentItemRepository.findById with correct value", async () => {
      const { sut, paymentItemRepositorySpy } = makeSut();

      await sut.execute({
        paymentId: "any_payments_id",
        paymentItemId: "any_payment_item_id",
      });
      expect(paymentItemRepositorySpy.paymentItemId).toBe(
        "any_payment_item_id",
      );
      expect(paymentItemRepositorySpy.paymentId).toBe("any_payments_id");
    });

    test("Should return payment correctly", async () => {
      const { sut } = makeSut();

      const payment = await sut.execute({
        paymentItemId: "any_payment_item_id",
        paymentId: "any_payments_id",
      });
      expect(payment).toEqual({
        id: "any_payment_item_id",
        payment_id: "any_payment_id",
        order_item_id: "any_order_item_id",
        quantity: 1,
        amount: 30,
        created_at: "any_date",
      });
    });
  });

  test("Should throw if invalid dependency is provided", async () => {
    const suts = [
      new GetPaymentItemUseCase(),
      new GetPaymentItemUseCase({}),
      new GetPaymentItemUseCase({
        paymentItemRepository: {},
      }),
    ];

    for (const sut of suts) {
      await expect(
        sut.execute({
          paymentItemId: "any_payment_item_id",
          paymentId: "any_payment_id",
        }),
      ).rejects.toThrow(TypeError);
      await expect(
        sut.execute({ paymentId: "any_payment_id" }),
      ).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if dependency throws", async () => {
    const suts = [
      new GetPaymentItemUseCase({
        paymentItemRepository: makePaymentItemRepositoryWithError(),
      }),
    ];

    for (const sut of suts) {
      await expect(
        sut.execute({
          paymentItemId: "any_payment_item_id",
          paymentId: "any_payment_id",
        }),
      ).rejects.toThrow(new Error());
      await expect(
        sut.execute({ paymentId: "any_payment_id" }),
      ).rejects.toThrow(new Error());
    }
  });
});
