import RegisterOrderUseCase from "../../../domain/usecase/order/register-order-usecase.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const idGeneratorSpy = makeIdGenerator();
  const orderRepositorySpy = makeOrderRepository();
  const sut = new RegisterOrderUseCase({
    idGenerator: idGeneratorSpy,
    orderRepository: orderRepositorySpy,
  });
  return {
    sut,
    idGeneratorSpy,
    orderRepositorySpy,
  };
};

const makeIdGenerator = () => {
  const idGeneratorSpy = {
    execute() {
      return this.id;
    },
  };
  idGeneratorSpy.id = "any_order_id";
  return idGeneratorSpy;
};

const makeIdGeneratorWithError = () => ({
  execute() {
    throw new Error();
  },
});

const makeOrderRepository = () => {
  class OrderRepositorySpy {
    async create({ id, businessId, tableId, tableNumber }) {
      this.id = id;
      this.businessId = businessId;
      this.tableId = tableId;
      this.tableNumber = tableNumber;
      return this.order;
    }
  }

  const orderRepositorySpy = new OrderRepositorySpy();
  orderRepositorySpy.order = {
    id: "any_order_id",
    businessId: "any_business_id",
    tableId: "any_table_id",
    tableNumber: "any_table_number",
  };
  return orderRepositorySpy;
};

const makeOrderRepositoryWithError = () => {
  class OrderRepositorySpy {
    create() {
      throw new Error();
    }
  }

  return new OrderRepositorySpy();
};

describe("Register Order UseCase", () => {
  test("Should throw if no props are provided", async () => {
    const { sut } = makeSut();
    // melhorar essa validação
    await expect(sut.execute()).rejects.toThrow(
      new MissingParamError("businessId"),
    );
  });

  test("Should throw if no businessId is provided", async () => {
    const { sut } = makeSut();
    const props = { tableId: "any_table_id", tableNumber: "any_table_number" };

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("businessId"),
    );
  });

  test("Should throw if no tableId are provided", async () => {
    const { sut } = makeSut();
    const props = {
      businessId: "any_business_id",
      tableNumber: "any_table_number",
    };
    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("tableId"),
    );
  });

  test("Should throw if no tableNumber is provided", async () => {
    const { sut } = makeSut();
    const props = { tableId: "any_table_id", businessId: "any_business_id" };
    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("tableNumber"),
    );
  });

  test("Should call orderRepository with correct values", async () => {
    const { sut, orderRepositorySpy, idGeneratorSpy } = makeSut();
    const props = {
      businessId: "any_business_id",
      tableId: "any_table_id",
      tableNumber: "any_table_number",
    };

    await sut.execute(props);
    expect(orderRepositorySpy.id).toBe(idGeneratorSpy.id);
    expect(orderRepositorySpy.businessId).toBe(props.businessId);
    expect(orderRepositorySpy.tableId).toBe(props.tableId);
    expect(orderRepositorySpy.tableNumber).toBe(props.tableNumber);
  });

  test("Should return order if everything is right", async () => {
    const { sut } = makeSut();

    const props = {
      businessId: "any_business_id",
      tableId: "any_table_id",
      tableNumber: "any_table_number",
    };

    const order = await sut.execute(props);
    expect(order).toEqual({
      id: "any_order_id",
      businessId: "any_business_id",
      tableId: "any_table_id",
      tableNumber: "any_table_number",
    });
  });

  test("Should throw if invalid dependencies are provided", async () => {
    const idGenerator = makeIdGenerator();
    const suts = [
      new RegisterOrderUseCase(),
      new RegisterOrderUseCase({}),
      new RegisterOrderUseCase({ idGenerator: {} }),
      new RegisterOrderUseCase({ idGenerator }),
      new RegisterOrderUseCase({ idGenerator, orderRepository: {} }),
    ];

    const props = {
      businessId: "any_business_id",
      tableId: "any_table_id",
      tableNumber: "any_table_number",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if any dependency throws", async () => {
    const idGenerator = makeIdGenerator();
    const suts = [
      new RegisterOrderUseCase({
        idGenerator: makeIdGeneratorWithError(),
      }),
      new RegisterOrderUseCase({
        idGenerator,
        orderRepository: makeOrderRepositoryWithError(),
      }),
    ];

    const props = {
      businessId: "any_business_id",
      tableId: "any_table_id",
      tableNumber: "any_table_number",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow();
    }
  });
});
