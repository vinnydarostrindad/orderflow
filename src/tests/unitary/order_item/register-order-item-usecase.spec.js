import RegisterOrderItemUseCase from "../../../domain/usecase/order_item/register-order-item-usecase.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const idGeneratorSpy = makeIdGenerator();
  const orderItemRepositorySpy = makeOrderItemRepository();
  const sut = new RegisterOrderItemUseCase({
    idGenerator: idGeneratorSpy,
    orderItemRepository: orderItemRepositorySpy,
  });
  return {
    sut,
    idGeneratorSpy,
    orderItemRepositorySpy,
  };
};

const makeIdGenerator = () => {
  const idGeneratorSpy = {
    execute() {
      return this.id;
    },
  };

  idGeneratorSpy.id = "any_order_item_id";
  return idGeneratorSpy;
};

const makeIdGeneratorWithError = () => {
  return {
    execute() {
      throw new Error();
    },
  };
};

const makeOrderItemRepository = () => {
  class OrderItemRepositorySpy {
    async create({
      id,
      orderId,
      menuItemId,
      quantity,
      unitPrice,
      totalPrice,
      notes,
    }) {
      this.id = id;
      this.orderId = orderId;
      this.menuItem_id = menuItemId;
      this.quantity = quantity;
      this.unitPrice = unitPrice;
      this.totalPrice = totalPrice;
      this.notes = notes;
      return this.orderItem;
    }
  }

  const orderItemRepositorySpy = new OrderItemRepositorySpy();
  orderItemRepositorySpy.orderItem = {
    id: "any_order_item_id",
    order_id: "any_order_id",
    menu_item_id: "any_menu_item_id",
    quantity: 2,
    unit_price: 20,
    total_price: 40,
    status: "pending",
    notes: "any_notes",
  };
  return orderItemRepositorySpy;
};

const makeOrderItemRepositoryWithError = () => {
  class OrderItemRepositorySpy {
    create() {
      throw new Error();
    }
  }

  return new OrderItemRepositorySpy();
};

describe("Register Order Item UseCase", () => {
  test("Should return order item if everything is right", async () => {
    const { sut } = makeSut();
    const props = {
      orderId: "any_order_id",
      menuItemId: "any_menu_item_id",
      quantity: 2,
      unitPrice: 20,
      totalPrice: 40,
      notes: "any_notes",
    };

    const orderItem = await sut.execute(props);
    expect(orderItem).toEqual({
      id: "any_order_item_id",
      order_id: "any_order_id",
      menu_item_id: "any_menu_item_id",
      quantity: 2,
      unit_price: 20,
      total_price: 40,
      status: "pending",
      notes: "any_notes",
    });
  });

  test("Should throw if no props are provided ", async () => {
    const { sut } = makeSut();
    await expect(sut.execute()).rejects.toThrow(
      new MissingParamError("orderId"),
    );
  });

  test("Should throw if no orderId is provided ", async () => {
    const { sut } = makeSut();
    const props = {
      menuItemId: "any_menu_item_id",
      quantity: 2,
      unitPrice: 20,
      totalPrice: 40,
      notes: "any_notes",
    };
    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("orderId"),
    );
  });

  test("Should throw if no menuItemId is provided ", async () => {
    const { sut } = makeSut();
    const props = {
      orderId: "any_order_id",
      quantity: 2,
      unitPrice: 20,
      totalPrice: 40,
      notes: "any_notes",
    };
    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("menuItemId"),
    );
  });

  test("Should throw if no quantity is provided ", async () => {
    const { sut } = makeSut();
    const props = {
      orderId: "any_order_id",
      menuItemId: "any_menu_item_id",
      unitPrice: 20,
      totalPrice: 40,
      notes: "any_notes",
    };

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("quantity"),
    );
  });

  test("Should throw if no unitPrice is provided ", async () => {
    const { sut } = makeSut();
    const props = {
      orderId: "any_order_id",
      menuItemId: "any_menu_item_id",
      quantity: 2,
      totalPrice: 40,
      notes: "any_notes",
    };

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("unitPrice"),
    );
  });

  test("Should throw if no totalPrice is provided ", async () => {
    const { sut } = makeSut();
    const props = {
      orderId: "any_order_id",
      menuItemId: "any_menu_item_id",
      quantity: 2,
      unitPrice: 20,
      notes: "any_notes",
    };

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("totalPrice"),
    );
  });

  test("Should call orderItemRepository with correct values", async () => {
    const { sut, orderItemRepositorySpy, idGeneratorSpy } = makeSut();
    const props = {
      orderId: "any_order_id",
      menuItemId: "any_menu_item_id",
      quantity: 2,
      unitPrice: 20,
      totalPrice: 40,
      notes: "any_notes",
    };

    await sut.execute(props);
    expect(orderItemRepositorySpy.id).toBe(idGeneratorSpy.id);
    expect(orderItemRepositorySpy.orderId).toBe("any_order_id");
    expect(orderItemRepositorySpy.quantity).toBe(2);
    expect(orderItemRepositorySpy.unitPrice).toBe(20);
    expect(orderItemRepositorySpy.totalPrice).toBe(40);
    expect(orderItemRepositorySpy.notes).toBe("any_notes");
  });

  test("Should throw if invalid dependencieses are provided", async () => {
    const idGenerator = makeIdGenerator();
    const suts = [
      new RegisterOrderItemUseCase(),
      new RegisterOrderItemUseCase({}),
      new RegisterOrderItemUseCase({
        idGenerator: {},
      }),
      new RegisterOrderItemUseCase({
        idGenerator,
      }),
      new RegisterOrderItemUseCase({
        idGenerator,
        orderItemRepository: {},
      }),
    ];
    const props = {
      orderId: "any_order_id",
      menuItemId: "any_menu_item_id",
      quantity: 2,
      unitPrice: 20,
      totalPrice: 40,
      notes: "any_notes",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if any dependency throws", async () => {
    const idGenerator = makeIdGenerator();
    const suts = [
      new RegisterOrderItemUseCase({
        idGenerator: makeIdGeneratorWithError(),
      }),
      new RegisterOrderItemUseCase({
        idGenerator,
        orderItemRepository: makeOrderItemRepositoryWithError(),
      }),
    ];
    const props = {
      orderId: "any_order_id",
      menuItemId: "any_menu_item_id",
      quantity: 2,
      unitPrice: 20,
      totalPrice: 40,
      notes: "any_notes",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow();
    }
  });
});
