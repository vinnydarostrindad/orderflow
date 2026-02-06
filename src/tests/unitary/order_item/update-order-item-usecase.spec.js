import UpdateOrderItemUseCase from "../../../domain/usecase/order_item/update-order-item-usecase.js";
import MissingParamError from "../../../utils/errors/missing-param-error";

const makeSut = () => {
  const orderItemRepositorySpy = makeOrderItemRepository();
  const sut = new UpdateOrderItemUseCase({
    orderItemRepository: orderItemRepositorySpy,
  });
  return { sut, orderItemRepositorySpy };
};

const makeOrderItemRepository = () => {
  class OrderItemRepositorySpy {
    orderItem;

    async update({ businessId, orderItemId, status, quantity, notes }) {
      this.businessId = businessId;
      this.orderItemId = orderItemId;
      this.status = status;
      this.quantity = quantity;
      this.notes = notes;

      this.orderItem.status = status;
      this.orderItem.quantity = quantity;
      this.orderItem.notes = notes;
      this.orderItem.total_price = this.orderItem.unit_price * quantity;
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
    status: "any_status",
    notes: "any_notes",
  };
  return orderItemRepositorySpy;
};

const makeOrderItemRepositoryWithError = () => {
  class OrderItemRepositorySpy {
    update() {
      throw new Error();
    }
  }

  return new OrderItemRepositorySpy();
};

describe("Update Order Item Usecase", () => {
  test("Should return 400 if no businessId is provided", async () => {
    const { sut } = makeSut();
    const props = {
      orderItemId: "valid_order_item_id",
      status: "updated_status",
      quantity: 4,
      notes: "updated_notes",
    };

    await expect(sut.execute(props)).rejects.toThrow(MissingParamError);
  });

  test("Should return 400 if no orderitemId is provided", async () => {
    const { sut } = makeSut();
    const props = {
      businessId: "valid_business_id",
      status: "updated_status",
      quantity: 4,
      notes: "updated_notes",
    };

    await expect(sut.execute(props)).rejects.toThrow(MissingParamError);
  });

  test("Should call OrderItemRepository with correct values", async () => {
    const { sut, orderItemRepositorySpy } = makeSut();

    const props = {
      businessId: "valid_business_id",
      orderItemId: "valid_order_item_id",
      status: "updated_status",
      quantity: 4,
      notes: "updated_notes",
    };

    await sut.execute(props);
    expect(orderItemRepositorySpy.businessId).toEqual(props.businessId);
    expect(orderItemRepositorySpy.orderItemId).toEqual(props.orderItemId);
    expect(orderItemRepositorySpy.status).toEqual(props.status);
    expect(orderItemRepositorySpy.quantity).toEqual(props.quantity);
    expect(orderItemRepositorySpy.notes).toEqual(props.notes);
  });

  test("Should return updated order item correctly", async () => {
    const { sut } = makeSut();

    const props = {
      businessId: "valid_business_id",
      orderItemId: "valid_order_item_id",
      status: "updated_status",
      quantity: 4,
      notes: "updated_notes",
    };

    const updatedOrderItem = await sut.execute(props);
    expect(updatedOrderItem).toMatchObject({
      id: "any_order_item_id",
      order_id: "any_order_id",
      menu_item_id: "any_menu_item_id",
      quantity: 4,
      unit_price: 20,
      total_price: 80,
      status: "updated_status",
      notes: "updated_notes",
    });
  });

  test("Should throw if invalid dependencieses are provided", async () => {
    const suts = [
      new UpdateOrderItemUseCase(),
      new UpdateOrderItemUseCase({}),
      new UpdateOrderItemUseCase({
        orderItemRepository: {},
      }),
    ];
    const props = {
      businessId: "any_business_id",
      orderItemId: "any_order_item_id",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if any dependency throws", async () => {
    const suts = [
      new UpdateOrderItemUseCase({
        orderItemRepository: makeOrderItemRepositoryWithError(),
      }),
    ];
    const props = {
      businessId: "any_order_item_id",
      orderItemId: "any_order_item_id",
      quantity: 2,
      notes: "any_notes",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow();
    }
  });
});
