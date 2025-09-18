import GetOrderUseCase from "../../../domain/usecase/order/get-order-usecase.js";

const makeSut = () => {
  const orderRepositorySpy = makeOrderRepository();
  const sut = new GetOrderUseCase({
    orderRepository: orderRepositorySpy,
  });
  return {
    sut,
    orderRepositorySpy,
  };
};

const makeOrderRepository = () => {
  class OrderRepositorySpy {
    async findAll(tableId) {
      this.tableId = tableId;
      return this.orders;
    }

    async findByBusinessId(businessId, orderId) {
      this.businessId = businessId;
      this.orderId = orderId;
      return this.order;
    }

    async findByTableId(tableId, orderId) {
      this.tableId = tableId;
      this.orderId = orderId;
      return this.order;
    }
  }

  const orderRepositorySpy = new OrderRepositorySpy();
  orderRepositorySpy.order = {
    id: "any_order_id",
    business_id: "any_business_id",
    table_id: "any_table_id",
    table_number: 1,
    status: "pending",
  };
  orderRepositorySpy.orders = [
    {
      id: "any_order_id",
      business_id: "any_business_id",
      table_id: "any_table_id",
      table_number: 1,
      status: "pending",
    },
  ];
  return orderRepositorySpy;
};

const makeOrderRepositoryWithError = () => {
  class OrderRepositorySpy {
    findByTableId() {
      throw new Error();
    }
    findByBusinessId() {
      throw new Error();
    }
    findAll() {
      throw new Error();
    }
  }

  return new OrderRepositorySpy();
};

describe("Get Order Usecase", () => {
  describe("With businessId", () => {
    test("Should return null if order is invalid", async () => {
      const { sut, orderRepositorySpy } = makeSut();
      orderRepositorySpy.order = null;

      const order = await sut.execute({
        businessId: "any_business_id",
        orderId: "any_order_id",
      });
      expect(order).toBeNull();
    });

    test("Should call orderRepository.findByBusinessId with correct value", async () => {
      const { sut, orderRepositorySpy } = makeSut();

      await sut.execute({
        businessId: "any_business_id",
        orderId: "any_order_id",
      });
      expect(orderRepositorySpy.businessId).toBe("any_business_id");
      expect(orderRepositorySpy.orderId).toBe("any_order_id");
    });

    test("Should return order correctly", async () => {
      const { sut } = makeSut();

      const order = await sut.execute({
        businessId: "any_business_id",
        orderId: "any_order_id",
      });
      expect(order).toEqual({
        id: "any_order_id",
        business_id: "any_business_id",
        table_id: "any_table_id",
        table_number: 1,
        status: "pending",
      });
    });
  });

  describe("Without orderId", () => {
    test("Should return null if orders is invalid", async () => {
      const { sut, orderRepositorySpy } = makeSut();
      orderRepositorySpy.orders = null;

      const order = await sut.execute({
        tableId: "any_table_id",
      });
      expect(order).toBeNull();
    });

    test("Should call orderRepository.findAll with correct value", async () => {
      const { sut, orderRepositorySpy } = makeSut();

      await sut.execute({ tableId: "any_table_id" });
      expect(orderRepositorySpy.tableId).toBe("any_table_id");
    });

    test("Should return an array of orders", async () => {
      const { sut } = makeSut();

      const orders = await sut.execute({ tableId: "any_table_id" });
      expect(Array.isArray(orders)).toBe(true);
      expect(orders[0]).toEqual({
        id: "any_order_id",
        business_id: "any_business_id",
        table_id: "any_table_id",
        table_number: 1,
        status: "pending",
      });
    });
  });

  describe("With orderId", () => {
    test("Should return null if order is invalid", async () => {
      const { sut, orderRepositorySpy } = makeSut();
      orderRepositorySpy.order = null;

      const order = await sut.execute({
        tableId: "any_table_id",
        orderId: "any_order_id",
      });
      expect(order).toBeNull();
    });

    test("Should call orderRepository.findByTableId with correct value", async () => {
      const { sut, orderRepositorySpy } = makeSut();

      await sut.execute({ tableId: "any_table_id", orderId: "any_order_id" });
      expect(orderRepositorySpy.tableId).toBe("any_table_id");
      expect(orderRepositorySpy.orderId).toBe("any_order_id");
    });

    test("Should return order correctly", async () => {
      const { sut } = makeSut();

      const order = await sut.execute({
        tableId: "any_table_id",
        orderId: "any_order_id",
      });
      expect(order).toEqual({
        id: "any_order_id",
        business_id: "any_business_id",
        table_id: "any_table_id",
        table_number: 1,
        status: "pending",
      });
    });
  });

  test("Should throw if invalid dependency is provided", async () => {
    const suts = [
      new GetOrderUseCase(),
      new GetOrderUseCase({}),
      new GetOrderUseCase({
        orderRepository: {},
      }),
    ];

    for (const sut of suts) {
      await expect(sut.execute("any_table_id", "any_order_id")).rejects.toThrow(
        TypeError,
      );
      await expect(sut.execute("any_table_id")).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if dependency throws", async () => {
    const suts = [
      new GetOrderUseCase({
        orderRepository: makeOrderRepositoryWithError(),
      }),
    ];

    for (const sut of suts) {
      await expect(sut.execute("any_table_id", "any_order_id")).rejects.toThrow(
        new Error(),
      );
      await expect(sut.execute("any_table_id")).rejects.toThrow(new Error());
    }
  });
});
