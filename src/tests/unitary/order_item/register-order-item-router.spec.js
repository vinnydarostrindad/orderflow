import MissingParamError from "../../../utils/errors/missing-param-error.js";
import RegisterOrderItemRouter from "../../../presentation/routers/order_item/register-order-item-router.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";

const makeSut = () => {
  const registerOrderItemUseCaseSpy = makeRegisterOrderItemUseCase();
  const validatorsSpy = makeValidators();
  const sut = new RegisterOrderItemRouter({
    registerOrderItemUseCase: registerOrderItemUseCaseSpy,
    validators: validatorsSpy,
  });
  return { sut, registerOrderItemUseCaseSpy, validatorsSpy };
};

const makeRegisterOrderItemUseCase = () => {
  class RegisterOrderItemUseCaseSpy {
    async execute({
      orderId,
      menuItemId,
      quantity,
      unitPrice,
      totalPrice,
      notes,
    }) {
      this.orderId = orderId;
      this.menuItemId = menuItemId;
      this.quantity = quantity;
      this.unit_price = unitPrice;
      this.total_price = totalPrice;
      this.notes = notes;
      return this.orderItem;
    }
  }

  const useCaseSpy = new RegisterOrderItemUseCaseSpy();
  useCaseSpy.orderItem = {
    id: "any_order_item_id",
    order_id: "any_order_id",
    menu_item_id: "any_menu_item_id",
    quantity: 2,
    status: "pending",
    unit_price: 20,
    total_price: 40,
    notes: "any_notes",
  };
  return useCaseSpy;
};

const makeRegisterOrderItemUseCaseWithError = () => {
  class RegisterOrderItemUseCaseSpy {
    execute() {
      throw new Error();
    }
  }

  return new RegisterOrderItemUseCaseSpy();
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

describe("Register Order Item Router", () => {
  test("Should call registerOrderItemUseCase with correct values", async () => {
    const { sut, registerOrderItemUseCaseSpy } = makeSut();
    const httpRequest = {
      params: { orderId: "any_order_id" },
      body: {
        menuItemId: "any_menu_item_id",
        quantity: 2,
        unitPrice: 20,
        totalPrice: 40,
        notes: "any_notes",
      },
    };

    await sut.route(httpRequest);
    expect(registerOrderItemUseCaseSpy.orderId).toBe("any_order_id");
    expect(registerOrderItemUseCaseSpy.menuItemId).toBe("any_menu_item_id");
    expect(registerOrderItemUseCaseSpy.quantity).toBe(2);
    expect(registerOrderItemUseCaseSpy.unit_price).toBe(20);
    expect(registerOrderItemUseCaseSpy.total_price).toBe(40);
    expect(registerOrderItemUseCaseSpy.notes).toBe("any_notes");
  });

  test("Should return 201 with created order item", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { orderId: "any_order_id" },
      body: {
        menuItemId: "any_menu_item_id",
        quantity: 2,
        unitPrice: 20,
        totalPrice: 40,
        notes: "any_notes",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(201);
    expect(httpResponse.body).toEqual({
      id: "any_order_item_id",
      order_id: "any_order_id",
      menu_item_id: "any_menu_item_id",
      quantity: 2,
      status: "pending",
      unit_price: 20,
      total_price: 40,
      notes: "any_notes",
    });
  });

  test("Should return 400 if no orderId is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: {},
      body: {
        menuItemId: "any_menu_item_id",
        quantity: 2,
        unitPrice: 20,
        totalPrice: 40,
        notes: "any_notes",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("orderId"));
  });

  test("Should return 400 if orderId is invalid", async () => {
    const { sut, validatorsSpy } = makeSut();
    const httpRequest = {
      params: { orderId: "invalid_order_id" },
      body: {
        menuItemId: "valid_menu_item_id",
        quantity: 2,
        unitPrice: 20,
        totalPrice: 40,
        notes: "any_notes",
      },
    };

    validatorsSpy.isValid = false;

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("orderId"));
  });

  test("Should return 400 if no menuItemId is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { orderId: "any_order_id" },
      body: {
        quantity: 2,
        unit_price: 20,
        total_price: 40,
        notes: "any_notes",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("menuItemId"));
  });

  test("Should return 400 if menuItemId is invalid", async () => {
    const { sut, validatorsSpy } = makeSut();
    const httpRequest = {
      params: { orderId: "valid_order_id" },
      body: {
        menuItemId: "invalid_menu_item_id",
        quantity: 2,
        unitPrice: 20,
        totalPrice: 40,
        notes: "any_notes",
      },
    };

    validatorsSpy.isValid = false;

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError("menuItemId"));
  });

  test("Should return 400 if no quantity is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { orderId: "any_order_id" },
      body: {
        menuItemId: "any_menu_item_id",
        unitPrice: 20,
        totalPrice: 40,
        notes: "any_notes",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("quantity"));
  });

  test("Should return 400 if no unitPrice is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { orderId: "any_order_id" },
      body: {
        menuItemId: "any_menu_item_id",
        quantity: 2,
        totalPrice: 40,
        notes: "any_notes",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("unitPrice"));
  });

  test("Should return 400 if no totalPrice is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { orderId: "any_order_id" },
      body: {
        menuItemId: "any_menu_item_id",
        quantity: 1,
        unitPrice: 20,
        notes: "any_notes",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("totalPrice"));
  });

  test("Should throw if no httpRequest is provided", async () => {
    const { sut } = makeSut();

    await expect(sut.route()).rejects.toThrow();
  });

  test("Should throw if no httpRequest has no params", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        menuItemId: "any_menu_item_id",
        quantity: 2,
        unitPrice: 20,
        totalPrice: 40,
        notes: "any_notes",
      },
    };

    await expect(sut.route(httpRequest)).rejects.toThrow();
  });

  test("Should throw if no httpRequest has no body", async () => {
    const { sut } = makeSut();
    const httpRequest = { params: { orderId: "any_order_id" } };

    await expect(sut.route(httpRequest)).rejects.toThrow();
  });

  test("Should throw if dependency is invalid", async () => {
    const suts = [
      new RegisterOrderItemRouter(),
      new RegisterOrderItemRouter({}),
      new RegisterOrderItemRouter({ registerOrderItemUseCase: {} }),
      new RegisterOrderItemRouter({
        registerOrderItemUseCase: makeRegisterOrderItemUseCase(),
        validators: {},
      }),
    ];

    const httpRequest = {
      params: { orderId: "any_order_id" },
      body: {
        menuItemId: "any_menu_item_id",
        quantity: 2,
        unitPrice: 20,
        totalPrice: 40,
        notes: "any_notes",
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });

  test("Should throw if dependency throws", async () => {
    const suts = [
      new RegisterOrderItemRouter({
        registerOrderItemUseCase: makeRegisterOrderItemUseCaseWithError(),
      }),
      new RegisterOrderItemRouter({
        registerOrderItemUseCase: makeRegisterOrderItemUseCase(),
        validators: makeValidatorsWithError(),
      }),
    ];

    const httpRequest = {
      params: { orderId: "any_order_id" },
      body: {
        menuItemId: "any_menu_item_id",
        quantity: 2,
        unitPrice: 20,
        totalPrice: 40,
        notes: "any_notes",
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });
});
