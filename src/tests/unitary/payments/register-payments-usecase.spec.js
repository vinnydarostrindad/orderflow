import RegisterPaymentsUseCase from "../../../domain/usecase/payments/register-payments-usecase.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const idGeneratorSpy = makeIdGenerator();
  const paymentRepositorySpy = makePaymentRepository();
  const sut = new RegisterPaymentsUseCase({
    idGenerator: idGeneratorSpy,
    paymentRepository: paymentRepositorySpy,
  });

  return { sut, idGeneratorSpy, paymentRepositorySpy };
};

const makeIdGenerator = () => {
  const idGeneratorSpy = {
    execute() {
      return this.id;
    },
  };

  idGeneratorSpy.id = "any_payment_id";

  return idGeneratorSpy;
};

const makeIdGeneratorWithError = () => {
  return {
    execute() {
      throw new Error();
    },
  };
};

const makePaymentRepository = () => {
  class PaymentRepositorySpy {
    async create({ id, tableSessionId, method, amount }) {
      this.id = id;
      this.tableSessionId = tableSessionId;
      this.method = method;
      this.amount = amount;
      return this.payment;
    }
  }

  const paymentRepositorySpy = new PaymentRepositorySpy();
  paymentRepositorySpy.payment = {
    id: "any_payment_id",
    table_session_id: "any_table_session_id",
    method: "pix",
    amount: 100,
    status: "completed",
  };

  return paymentRepositorySpy;
};

const makePaymentRepositoryWithError = () => {
  class PaymentRepositorySpy {
    create() {
      throw new Error();
    }
  }

  return new PaymentRepositorySpy();
};

describe("Register Payments UseCase", () => {
  test("Should return payment if everything is right", async () => {
    const { sut } = makeSut();
    const props = {
      tableSessionId: "any_table_session_id",
      method: "pix",
      amount: 100,
    };

    const payment = await sut.execute(props);

    expect(payment).toEqual({
      id: "any_payment_id",
      table_session_id: "any_table_session_id",
      method: "pix",
      amount: 100,
      status: "completed",
    });
  });

  test("Should throw if no props are provided", async () => {
    const { sut } = makeSut();

    await expect(sut.execute()).rejects.toThrow(
      new MissingParamError("tableSessionId"),
    );
  });

  test("Should throw if no tableSessionId is provided", async () => {
    const { sut } = makeSut();
    const props = {
      method: "pix",
      amount: 100,
    };

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("tableSessionId"),
    );
  });

  test("Should throw if no method is provided", async () => {
    const { sut } = makeSut();
    const props = {
      tableSessionId: "any_table_session_id",
      amount: 100,
    };

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("method"),
    );
  });

  test("Should throw if no amount is provided", async () => {
    const { sut } = makeSut();
    const props = {
      tableSessionId: "any_table_session_id",
      method: "pix",
    };

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("amount"),
    );
  });

  test("Should call paymentRepository with correct values", async () => {
    const { sut, paymentRepositorySpy, idGeneratorSpy } = makeSut();
    const props = {
      tableSessionId: "any_table_session_id",
      method: "pix",
      amount: 100,
    };

    await sut.execute(props);

    expect(paymentRepositorySpy.id).toBe(idGeneratorSpy.id);
    expect(paymentRepositorySpy.tableSessionId).toBe("any_table_session_id");
    expect(paymentRepositorySpy.method).toBe("pix");
    expect(paymentRepositorySpy.amount).toBe(100);
  });

  test("Should throw if invalid dependencies are provided", async () => {
    const idGenerator = makeIdGenerator();
    const suts = [
      new RegisterPaymentsUseCase(),
      new RegisterPaymentsUseCase({}),
      new RegisterPaymentsUseCase({ idGenerator: {} }),
      new RegisterPaymentsUseCase({ idGenerator }),
      new RegisterPaymentsUseCase({ idGenerator, paymentRepository: {} }),
    ];

    const props = {
      tableSessionId: "any_table_session_id",
      method: "pix",
      amount: 100,
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if any dependency throws", async () => {
    const idGenerator = makeIdGenerator();
    const suts = [
      new RegisterPaymentsUseCase({ idGenerator: makeIdGeneratorWithError() }),
      new RegisterPaymentsUseCase({
        idGenerator,
        paymentRepository: makePaymentRepositoryWithError(),
      }),
    ];

    const props = {
      tableSessionId: "any_table_session_id",
      method: "pix",
      amount: 100,
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow();
    }
  });
});
