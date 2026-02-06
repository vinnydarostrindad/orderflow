import GetOrderItemRouter from "../../../presentation/routers/order_item/get-order-item-router.js";
import NotFoundError from "../../../utils/errors/not-found-error.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const getOrderItemUseCaseSpy = makeGetOrderItemUseCase();
  const validatorsSpy = makeValidators();
  const sut = new GetOrderItemRouter({
    getOrderItemUseCase: getOrderItemUseCaseSpy,
    validators: validatorsSpy,
  });
  return { sut, getOrderItemUseCaseSpy, validatorsSpy };
};

const makeGetOrderItemUseCase = () => {
  class GetOrderItemUseCaseSpy {
    async execute({ orderId, orderItemId, businessId }) {
      this.orderId = orderId;
      this.businessId = businessId;
      if (!orderItemId) {
        return this.orderItems;
      }

      this.orderItemId = orderItemId;
      return this.orderItem;
    }
  }

  const getOrderItemUseCaseSpy = new GetOrderItemUseCaseSpy();
  getOrderItemUseCaseSpy.orderItem = {
    id: "any_order_item_id",
    order_id: "any_order_id",
    menu_item_id: "any_menu_item_id",
    quantity: 2,
    status: "pending",
    unit_price: "20.00",
    total_price: "40.00",
    notes: "any_notes",
    order_item_created_at: "any_time",
    table_number: "any_table_number",
  };
  getOrderItemUseCaseSpy.orderItems = [
    {
      id: "any_order_item_id",
      order_id: "any_order_id",
      menu_item_id: "any_menu_item_id",
      quantity: 2,
      status: "pending",
      unit_price: "20.00",
      total_price: "40.00",
      notes: "any_notes",
      order_item_created_at: "any_time",
      table_number: "any_table_number",
    },
  ];
  return getOrderItemUseCaseSpy;
};

const makeGetOrderItemUseCaseWithError = () => {
  class GetOrderItemUseCaseSpy {
    execute() {
      throw new Error();
    }
  }

  return new GetOrderItemUseCaseSpy();
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

describe("Get Order Item Router", () => {
  describe("With businessId", () => {
    test("Should return 400 if no businessId is provided", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: {},
        auth: {},
        query: {},
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.body).toEqual(new MissingParamError("businessId"));
    });

    test("Should return 400 if invalid businessId is provided", async () => {
      const { sut, validatorsSpy } = makeSut();
      const httpRequest = {
        params: {},
        auth: { businessId: "invalid_business_id" },
        query: {},
      };

      validatorsSpy.isValid = false;

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.body).toEqual(new InvalidParamError("businessId"));
    });

    test("Should call getOrderItemUseCase with correct value", async () => {
      const { sut, getOrderItemUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {},
        auth: { businessId: "any_business_id" },
        query: {},
      };

      await sut.route(httpRequest);
      expect(getOrderItemUseCaseSpy.businessId).toBe("any_business_id");
      expect(getOrderItemUseCaseSpy.orderItemId).toBeUndefined();
    });

    test("Should return 200 and order item", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: {},
        auth: { businessId: "any_business_id" },
        query: {},
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(200);
      expect(Array.isArray(httpResponse.body)).toBeTruthy();
      expect(httpResponse.body[0]).toEqual({
        id: "any_order_item_id",
        orderId: "any_order_id",
        tableNumber: "any_table_number",
        createdAt: "any_time",
        menuItemId: "any_menu_item_id",
        quantity: "2",
        notes: "any_notes",
        status: "pending",
        totalPrice: "40.00",
      });
    });
  });

  describe("With orderId", () => {
    test("Should call getOrderItemUseCase with correct value", async () => {
      const { sut, getOrderItemUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          orderId: "any_order_id",
        },
        auth: {
          businessId: "any_business_id",
        },
        query: {},
      };

      await sut.route(httpRequest);
      expect(getOrderItemUseCaseSpy.orderId).toBe("any_order_id");
      expect(getOrderItemUseCaseSpy.orderItemId).toBeUndefined();
    });

    test("Should return 200 and a array of order items", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: {
          orderId: "any_order_id",
        },
        auth: {
          businessId: "any_business_id",
        },
        query: {},
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(200);
      expect(Array.isArray(httpResponse.body)).toBe(true);
      expect(httpResponse.body[0]).toEqual({
        id: "any_order_item_id",
        orderId: "any_order_id",
        menuItemId: "any_menu_item_id",
        quantity: "2",
        status: "pending",
        unitPrice: "20.00",
        totalPrice: "40.00",
        notes: "any_notes",
      });
    });
  });

  describe("With orderId and orderItemId", () => {
    test("Should return 400 if orderItemId is invalid", async () => {
      const { sut, validatorsSpy } = makeSut();
      const httpRequest = {
        params: {
          orderId: "valid_order_id",
          orderItemId: "invalid_order_item_id",
        },
        auth: {
          businessId: "any_business_id",
        },
        query: {},
      };

      validatorsSpy.isValid = false;

      const httpResponse = await sut.route(httpRequest);

      expect(httpResponse.statusCode).toBe(400);
      expect(httpResponse.body).toEqual(new InvalidParamError("orderItemId"));
    });

    test("Should return 404 if no orderItem is found", async () => {
      const { sut, getOrderItemUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          orderId: "any_order_id",
          orderItemId: "any_order_item_id",
        },
        auth: {
          businessId: "any_business_id",
        },
        query: {},
      };
      getOrderItemUseCaseSpy.orderItem = null;

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(404);
      expect(httpResponse.body).toEqual(
        new NotFoundError({ resource: "OrderItem" }),
      );
    });

    test("Should call getOrderItemUseCase with correct value", async () => {
      const { sut, getOrderItemUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          orderId: "any_order_id",
          orderItemId: "any_order_item_id",
        },
        auth: {
          businessId: "any_business_id",
        },
        query: {},
      };

      await sut.route(httpRequest);
      expect(getOrderItemUseCaseSpy.orderId).toBe("any_order_id");
      expect(getOrderItemUseCaseSpy.orderItemId).toBe("any_order_item_id");
    });

    test("Should return 200 with orderItem correctly", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: {
          orderId: "any_order_id",
          orderItemId: "any_order_item_id",
        },
        auth: {
          businessId: "any_business_id",
        },
        query: {},
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(200);
      expect(httpResponse.body).toEqual({
        id: "any_order_item_id",
        orderId: "any_order_id",
        menuItemId: "any_menu_item_id",
        quantity: "2",
        status: "pending",
        unitPrice: "20.00",
        totalPrice: "40.00",
        notes: "any_notes",
      });
    });
  });

  test("Should return 400 if orderId is invalid", async () => {
    const { sut, validatorsSpy } = makeSut();
    const httpRequest = {
      params: {
        orderId: "invalid_order_id",
        orderItemId: "valid_order_item_id",
      },
      auth: {
        businessId: "any_business_id",
      },
      query: {},
    };

    validatorsSpy.isValid = false;

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("orderId"));
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
      new GetOrderItemRouter(),
      new GetOrderItemRouter({}),
      new GetOrderItemRouter({
        getOrderItemUseCase: {},
      }),
      new GetOrderItemRouter({
        getOrderItemUseCase: makeGetOrderItemUseCase(),
        validators: {},
      }),
    ];

    const httpRequest = {
      params: {
        orderId: "any_order_id",
        orderItemId: "any_order_item_id",
      },
      auth: {
        businessId: "any_business_id",
      },
      query: {},
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });

  test("Should throw if dependency throws", async () => {
    const suts = [
      new GetOrderItemRouter({
        getOrderItemUseCase: makeGetOrderItemUseCaseWithError(),
      }),
      new GetOrderItemRouter({
        getOrderItemUseCase: makeGetOrderItemUseCase(),
        validators: makeValidatorsWithError(),
      }),
    ];

    const httpRequest = {
      params: {
        orderId: "any_order_id",
        orderItemId: "any_order_item_id",
      },
      auth: {
        businessId: "any_business_id",
      },
      query: {},
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });
});
