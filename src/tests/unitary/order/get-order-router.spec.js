import MissingParamError from "../../../utils/errors/missing-param-error.js";
import NotFoundError from "../../../utils/errors/not-found-error.js";
import GetOrderRouter from "../../../presentation/routers/order/get-order-router.js";

const makeSut = () => {
  const getOrderUseCaseSpy = makeGetOrderUseCase();
  const validatorsSpy = makeValidators();
  const sut = new GetOrderRouter({
    getOrderUseCase: getOrderUseCaseSpy,
    validators: validatorsSpy,
  });
  return { sut, getOrderUseCaseSpy, validatorsSpy };
};

const makeGetOrderUseCase = () => {
  class GetOrderUseCaseSpy {
    async execute(tableId, orderId) {
      this.tableId = tableId;
      if (!orderId) return this.orders;

      this.orderId = orderId;
      return this.order;
    }
  }

  const getOrderUseCaseSpy = new GetOrderUseCaseSpy();
  getOrderUseCaseSpy.order = {
    id: "any_order_id",
    business_id: "any_business_id",
    table_id: "any_table_id",
    table_number: "any_table_number",
    status: "pending",
  };
  getOrderUseCaseSpy.orders = [
    {
      id: "any_order_id",
      business_id: "any_business_id",
      table_id: "any_table_id",
      table_number: "any_table_number",
      status: "pending",
    },
  ];
  return getOrderUseCaseSpy;
};

const makeGetOrderUseCaseWithError = () => {
  class GetOrderUseCaseSpy {
    execute() {
      throw new Error();
    }
  }

  return new GetOrderUseCaseSpy();
};

const makeValidators = () => {
  const validatorsSpy = {
    uuid(uuidValue) {
      this.uuidValue = uuidValue;
      return true;
    },
  };

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

describe("Get Order Router", () => {
  describe("Without orderId", () => {
    test("Should call getOrderUseCase with correct value", async () => {
      const { sut, getOrderUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          tableId: "any_table_id",
        },
      };

      await sut.route(httpRequest);
      expect(getOrderUseCaseSpy.tableId).toBe("any_table_id");
      expect(getOrderUseCaseSpy.orderId).toBeUndefined();
    });

    test("Should return 200 and an array of orders", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: {
          tableId: "any_table_id",
        },
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(200);
      expect(Array.isArray(httpResponse.body)).toBe(true);
      expect(httpResponse.body[0]).toEqual({
        id: "any_order_id",
        businessId: "any_business_id",
        tableId: "any_table_id",
        tableNumber: "any_table_number",
        status: "pending",
      });
    });
  });

  describe("With orderId", () => {
    test("Should return 404 if no order is found", async () => {
      const { sut, getOrderUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          tableId: "any_table_id",
          orderId: "any_order_id",
        },
      };
      getOrderUseCaseSpy.order = null;

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(404);
      expect(httpResponse.body).toEqual(
        new NotFoundError({ resource: "Order" }),
      );
    });

    test("Should call getOrderUseCase with correct values", async () => {
      const { sut, getOrderUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          tableId: "any_table_id",
          orderId: "any_order_id",
        },
      };

      await sut.route(httpRequest);
      expect(getOrderUseCaseSpy.tableId).toBe("any_table_id");
      expect(getOrderUseCaseSpy.orderId).toBe("any_order_id");
    });

    test("Should return 200 with the order", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: {
          tableId: "any_table_id",
          orderId: "any_order_id",
        },
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(200);
      expect(httpResponse.body).toEqual({
        id: "any_order_id",
        businessId: "any_business_id",
        tableId: "any_table_id",
        tableNumber: "any_table_number",
        status: "pending",
      });
    });
  });

  test("Should return 400 if no tableId is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: {
        orderId: "any_order_id",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("tableId"));
  });

  test("Should throw if no httpRequest is provided", async () => {
    const { sut } = makeSut();
    await expect(sut.route()).rejects.toThrow();
  });

  test("Should throw if httpRequest has no params", async () => {
    const { sut } = makeSut();
    const httpRequest = {};
    await expect(sut.route(httpRequest)).rejects.toThrow();
  });

  test("Should throw if invalid dependency is provided", async () => {
    const suts = [
      new GetOrderRouter(),
      new GetOrderRouter({}),
      new GetOrderRouter({
        getOrderUseCase: {},
      }),
      new GetOrderRouter({
        getOrderUseCase: makeGetOrderUseCase(),
        validators: {},
      }),
    ];
    const httpRequest = {
      params: {
        tableId: "any_table_id",
        orderId: "any_order_id",
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });

  test("Should throw if dependency throws", async () => {
    const suts = [
      new GetOrderRouter({
        getOrderUseCase: makeGetOrderUseCaseWithError(),
      }),
      new GetOrderRouter({
        getOrderUseCase: makeGetOrderUseCase(),
        validators: makeValidatorsWithError(),
      }),
    ];
    const httpRequest = {
      params: {
        tableId: "any_table_id",
        orderId: "any_order_id",
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });
});
