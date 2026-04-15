import MissingParamError from "../../../utils/errors/missing-param-error.js";
import UpdateOrderItemRouter from "../../../presentation/routers/order_item/update-order-item-router.js";
import InvalidParamError from "../../../utils/errors/invalid-param-error.js";

const makeSut = () => {
  const updateOrderItemUseCaseSpy = makeUpdateOrderItemUseCase();
  const validatorsSpy = makeValidators();
  const sut = new UpdateOrderItemRouter({
    updateOrderItemUseCase: updateOrderItemUseCaseSpy,
    validators: validatorsSpy,
  });
  return { sut, updateOrderItemUseCaseSpy, validatorsSpy };
};

const makeUpdateOrderItemUseCase = () => {
  class UpdateOrderItemUseCaseSpy {
    execute({ businessId, orderItemId, quantity, status, notes }) {
      this.businessId = businessId;
      this.orderItemId = orderItemId;
      this.quantity = quantity;
      this.status = status;
      this.notes = notes;

      return {
        id: "any_order_item_id",
        table_id: "any_table_id",
        business_id: "any_business_id",
        menu_item_id: "any_menu_item_id",
        created_at: "any_created_at",
        updated_at: "any_updated_at",
        quantity: this.quantity,
        status: this.status,
        notes: this.notes,
      };
    }
  }

  return new UpdateOrderItemUseCaseSpy();
};

const makeUpdateOrderItemUseCaseWithError = () => {
  class UpdateOrderItemUseCaseSpy {
    execute() {
      return new Error();
    }
  }

  return new UpdateOrderItemUseCaseSpy();
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

describe("Update Order Item Router", () => {
  test("Should return 400 if no businessId is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {},
      params: {},
      auth: {},
      query: {},
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.body).toEqual(new MissingParamError("businessId"));
  });

  test("Should return 400 if no orderItemId is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {},
      params: {},
      auth: { businessId: "any_business_id" },
      query: {},
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.body).toEqual(new MissingParamError("orderItemId"));
  });

  test("Should return 400 if businessId is invalid", async () => {
    const { sut, validatorsSpy } = makeSut();
    const httpRequest = {
      body: {},
      params: { orderItemId: "valid_order_item_id" },
      auth: { businessId: "invalid_business_id" },
      query: {},
    };

    validatorsSpy.isValid = false;

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.body).toEqual(new InvalidParamError("businessId"));
  });

  test("Should return 400 if orderItemId is invalid", async () => {
    const { sut, validatorsSpy } = makeSut();
    const httpRequest = {
      body: {},
      params: { orderItemId: "invalid_order_item_id" },
      auth: { businessId: "valid_business_id" },
      query: {},
    };

    validatorsSpy.isValid = false;

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.body).toEqual(new InvalidParamError("orderItemId"));
  });

  test("Should call updateOrderItemUseCase with correct values", async () => {
    const { sut, updateOrderItemUseCaseSpy } = makeSut();
    const httpRequest = {
      body: {
        id: "any_order_item_id",
        table_id: "any_table_id",
        menu_item_id: "any_menu_item_id",
        created_at: "any_created_at",
        updated_at: "any_updated_at",
        status: "any_status",
        quantity: 2,
        notes: "any_note",
      },
      params: { orderItemId: "valid_order_item_id" },
      auth: { businessId: "valid_business_id" },
      query: {},
    };

    await sut.route(httpRequest);
    expect(updateOrderItemUseCaseSpy.businessId).toEqual(
      httpRequest.auth.businessId,
    );
    expect(updateOrderItemUseCaseSpy.orderItemId).toEqual(
      httpRequest.params.orderItemId,
    );
    expect(updateOrderItemUseCaseSpy.status).toEqual(httpRequest.body.status);
    expect(updateOrderItemUseCaseSpy.quantity).toEqual(
      httpRequest.body.quantity,
    );
    expect(updateOrderItemUseCaseSpy.notes).toEqual(httpRequest.body.notes);
  });

  test("Should return 200 if everything goes right", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        id: "any_order_item_id",
        table_id: "any_table_id",
        menu_item_id: "any_menu_item_id",
        created_at: "any_created_at",
        updated_at: "any_updated_at",
        status: "any_status",
        quantity: 2,
        notes: "any_note",
      },
      params: { orderItemId: "invalid_order_item_id" },
      auth: { businessId: "valid_business_id" },
      query: {},
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse).toEqual({
      statusCode: 200,
      body: {
        id: "any_order_item_id",
        tableId: "any_table_id",
        businessId: "any_business_id",
        menuItemId: "any_menu_item_id",
        createdAt: "any_created_at",
        updatedAt: "any_updated_at",
        status: "any_status",
        quantity: "2",
        unitPrice: undefined,
        totalPrice: undefined,
        notes: "any_note",
      },
      headers: {},
    });
  });

  test("Should throw if dependency is invalid", async () => {
    const suts = [
      new UpdateOrderItemRouter(),
      new UpdateOrderItemRouter({}),
      new UpdateOrderItemRouter({ updateOrderItemUseCase: {} }),
      new UpdateOrderItemRouter({
        updateOrderItemUseCase: makeUpdateOrderItemUseCase(),
        validators: {},
      }),
    ];

    const httpRequest = {
      body: {
        id: "any_order_item_id",
        table_id: "any_table_id",
        menu_item_id: "any_menu_item_id",
        created_at: "any_created_at",
        updated_at: "any_updated_at",
        status: "any_status",
        quantity: 2,
        notes: "any_note",
      },
      params: { orderItemId: "invalid_order_item_id" },
      auth: { businessId: "valid_business_id" },
      query: {},
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });

  test("Should throw if dependency throws", async () => {
    const suts = [
      new UpdateOrderItemRouter({
        updateOrderItemUseCase: makeUpdateOrderItemUseCaseWithError(),
      }),
      new UpdateOrderItemRouter({
        updateOrderItemUseCase: makeUpdateOrderItemUseCase(),
        validators: makeValidatorsWithError(),
      }),
    ];

    const httpRequest = {
      body: {
        id: "any_order_item_id",
        table_id: "any_table_id",
        menu_item_id: "any_menu_item_id",
        created_at: "any_created_at",
        updated_at: "any_updated_at",
        status: "any_status",
        quantity: 2,
        notes: "any_note",
      },
      params: { orderItemId: "invalid_order_item_id" },
      auth: { businessId: "valid_business_id" },
      query: {},
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });
});
