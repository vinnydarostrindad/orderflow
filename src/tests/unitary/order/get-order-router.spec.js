import NotFoundError from "../../../utils/errors/not-found-error.js";
import GetOrderRouter from "../../../presentation/routers/order/get-order-router.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";

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
    async execute({ businessId, tableId, orderId }) {
      this.businessId = businessId;
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
    created_at: "any_time",
    tableId: "any_table_id",
    updated_at: "any_time",
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

describe("Get Order Router", () => {
  describe("With businessId", () => {
    test("Should return 404 if no order is found", async () => {
      const { sut, getOrderUseCaseSpy } = makeSut();
      const httpRequest = {
        params: { orderId: "any_order_id" },
        auth: { businessId: "any_business_id" },
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
        params: { orderId: "any_order_id" },
        auth: { businessId: "any_business_id" },
      };

      await sut.route(httpRequest);
      expect(getOrderUseCaseSpy.businessId).toBe("any_business_id");
      expect(getOrderUseCaseSpy.orderId).toBe("any_order_id");
    });

    test("Should return 200 with the order", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: { orderId: "any_order_id" },
        auth: { businessId: "any_business_id" },
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(200);
      expect(httpResponse.body).toEqual({
        id: "any_order_id",
        businessId: "any_business_id",
        tableId: "any_table_id",
        tableNumber: "any_table_number",
        status: "pending",
        createdAt: "any_time",
        updatedAt: "any_time",
      });
    });
  });

  describe("Without orderId", () => {
    test("Should call getOrderUseCase with correct value", async () => {
      const { sut, getOrderUseCaseSpy } = makeSut();
      const httpRequest = {
        params: { tableId: "any_table_id" },
        auth: { businessId: "any_business_id" },
      };

      await sut.route(httpRequest);
      expect(getOrderUseCaseSpy.tableId).toBe("any_table_id");
      expect(getOrderUseCaseSpy.orderId).toBeUndefined();
    });

    test("Should return 200 and an array of orders", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: { tableId: "any_table_id" },
        auth: { businessId: "any_business_id" },
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
    test("Should return 400 if orderId is invalid", async () => {
      const { sut, validatorsSpy } = makeSut();
      const httpRequest = {
        params: { tableId: "valid_table_id", orderId: "invalid_order_id" },
        auth: { businessId: "any_business_id" },
      };

      validatorsSpy.isValid = false;

      const httpResponse = await sut.route(httpRequest);

      expect(httpResponse.statusCode).toBe(400);
      expect(httpResponse.body).toEqual(new InvalidParamError("orderId"));
    });

    test("Should return 404 if no order is found", async () => {
      const { sut, getOrderUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          tableId: "any_table_id",
          orderId: "any_order_id",
        },
        auth: { businessId: "any_business_id" },
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
        auth: { businessId: "any_business_id" },
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
        auth: { businessId: "any_business_id" },
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(200);
      expect(httpResponse.body).toEqual({
        id: "any_order_id",
        businessId: "any_business_id",
        tableId: "any_table_id",
        tableNumber: "any_table_number",
        status: "pending",
        createdAt: "any_time",
        updatedAt: "any_time",
      });
    });
  });

  test("Should return 400 if tableId is invalid", async () => {
    const { sut, validatorsSpy } = makeSut();
    const httpRequest = {
      params: { tableId: "invalid_table_id" },
      auth: { businessId: "any_business_id" },
    };

    validatorsSpy.isValid = false;

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("tableId"));
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
      auth: { businessId: "any_business_id" },
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
