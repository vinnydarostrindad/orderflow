import GetPaymentUseCase from "../../../domain/usecase/payments/get-payments-usecase.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const paymentRepositorySpy = makePaymentRepository();
  const sut = new GetPaymentUseCase({
    paymentRepository: paymentRepositorySpy,
  });
  return {
    sut,
    paymentRepositorySpy,
  };
};

const makePaymentRepository = () => {
  class PaymentRepositorySpy {
    async findAllByTableSessionId(tableSessionId) {
      this.tableSessionId = tableSessionId;
      return this.payments;
    }

    async findById(tableSessionId, paymentId) {
      this.tableSessionId = tableSessionId;
      this.paymentId = paymentId;
      return this.payment;
    }

    async findAllByBusinessId(businessId) {
      this.businessId = businessId;
      return this.payments;
    }
  }

  const paymentRepositorySpy = new PaymentRepositorySpy();
  paymentRepositorySpy.payment = {
    id: "any_id",
    table_session_id: "any_table_session_id",
    method: "pix",
    amount: 100,
    status: "complete",
  };
  paymentRepositorySpy.payments = [paymentRepositorySpy.payment];
  return paymentRepositorySpy;
};

const makePaymentRepositoryWithError = () => {
  class paymentRepositorySpy {
    findById() {
      throw new Error();
    }
    findAllByTableSessionId() {
      throw new Error();
    }
    findAllByBusinessId() {
      throw new Error();
    }
  }

  return new paymentRepositorySpy();
};

describe("Get Payments Usecase", () => {
  describe("With tableSessionId", () => {
    test("Should call paymentRepository.findAllByTableSessionId with correct value", async () => {
      const { sut, paymentRepositorySpy } = makeSut();

      await sut.execute({ tableSessionId: "table_id" });
      expect(paymentRepositorySpy.tableSessionId).toBe("table_id");
      expect(paymentRepositorySpy.paymentId).toBeUndefined();
    });

    test("Should return an array of payments", async () => {
      const { sut } = makeSut();

      const payments = await sut.execute({ tableSessionId: "table_id" });
      expect(Array.isArray(payments)).toBe(true);
      expect(payments[0]).toEqual({
        id: "any_id",
        table_session_id: "any_table_session_id",
        method: "pix",
        amount: 100,
        status: "complete",
      });
    });
  });

  describe("With paymentId", () => {
    test("Should return null if payment is invalid", async () => {
      const { sut, paymentRepositorySpy } = makeSut();
      paymentRepositorySpy.payment = null;

      const payment = await sut.execute({
        tableSessionId: "table_id",
        paymentId: "any_payments_id",
      });
      expect(payment).toBeNull();
    });

    test("Should call paymentRepository.findById with correct value", async () => {
      const { sut, paymentRepositorySpy } = makeSut();

      await sut.execute({
        tableSessionId: "table_id",
        paymentId: "any_payments_id",
      });
      expect(paymentRepositorySpy.tableSessionId).toBe("table_id");
      expect(paymentRepositorySpy.paymentId).toBe("any_payments_id");
    });

    test("Should return payment correctly", async () => {
      const { sut } = makeSut();

      const payment = await sut.execute({
        tableSessionId: "table_id",
        paymentId: "any_payments_id",
      });
      expect(payment).toEqual({
        id: "any_id",
        table_session_id: "any_table_session_id",
        method: "pix",
        amount: 100,
        status: "complete",
      });
    });
  });

  describe("With businessId", () => {
    test("Should throw if no businessId is provided", async () => {
      const { sut } = makeSut();

      await expect(sut.execute({})).rejects.toThrow(
        new MissingParamError("businessId"),
      );
    });

    test("Should call paymentRepository.findAllByBusinessId with correct value", async () => {
      const { sut, paymentRepositorySpy } = makeSut();

      await sut.execute({
        businessId: "business_id",
      });
      expect(paymentRepositorySpy.businessId).toBe("business_id");
    });

    test("Should return payments correctly", async () => {
      const { sut } = makeSut();

      const payment = await sut.execute({
        businessId: "business_id",
      });
      expect(payment).toEqual([
        {
          id: "any_id",
          table_session_id: "any_table_session_id",
          method: "pix",
          amount: 100,
          status: "complete",
        },
      ]);
    });
  });

  test("Should throw if invalid dependency is provided", async () => {
    const suts = [
      new GetPaymentUseCase(),
      new GetPaymentUseCase({}),
      new GetPaymentUseCase({
        paymentRepository: {},
      }),
    ];

    for (const sut of suts) {
      await expect(
        sut.execute({
          tableSessionId: "table_id",
          paymentId: "any_payments_id",
        }),
      ).rejects.toThrow(TypeError);
      await expect(sut.execute({ tableSessionId: "table_id" })).rejects.toThrow(
        TypeError,
      );
    }
  });

  test("Should throw if dependency throws", async () => {
    const suts = [
      new GetPaymentUseCase({
        paymentRepository: makePaymentRepositoryWithError(),
      }),
    ];

    for (const sut of suts) {
      await expect(
        sut.execute({
          tableSessionId: "any_table_session_id",
          paymentId: "any_payments_id",
        }),
      ).rejects.toThrow(new Error());
      await expect(
        sut.execute({ tableSessionId: "any_table_session_id" }),
      ).rejects.toThrow(new Error());
    }
  });
});
