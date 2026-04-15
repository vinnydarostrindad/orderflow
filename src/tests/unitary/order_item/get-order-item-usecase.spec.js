import GetOrderItemUseCase from "../../../domain/usecase/order_item/get-order-item-usecase.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const orderItemRepositorySpy = makeOrderItemRepository();
  const sut = new GetOrderItemUseCase({
    orderItemRepository: orderItemRepositorySpy,
  });
  return {
    sut,
    orderItemRepositorySpy,
  };
};

const makeOrderItemRepository = () => {
  class OrderItemRepositorySpy {
    async findAll(tableId) {
      this.tableId = tableId;
      return this.orderItems;
    }

    async findById(tableId, orderItemId) {
      this.tableId = tableId;
      this.orderItemId = orderItemId;
      return this.orderItem;
    }

    async findAllByBusinessId(businessId) {
      this.businessId = businessId;
      return this.orderItems;
    }
  }

  const orderItemRepositorySpy = new OrderItemRepositorySpy();
  orderItemRepositorySpy.orderItem = {
    id: "any_order_item_id",
    table_id: "any_table_id",
    menu_item_id: "any_menu_item_id",
    quantity: 2,
    status: "pending",
    unit_price: "20.00",
    total_price: "40.00",
    notes: "any_notes",
  };
  orderItemRepositorySpy.orderItems = [
    {
      id: "any_order_item_id",
      table_id: "any_table_id",
      menu_item_id: "any_menu_item_id",
      quantity: 2,
      status: "pending",
      unit_price: "20.00",
      total_price: "40.00",
      notes: "any_notes",
    },
  ];
  return orderItemRepositorySpy;
};

const makeOrderItemRepositoryWithError = () => {
  class orderItemRepositorySpy {
    findById() {
      throw new Error();
    }
    findAll() {
      throw new Error();
    }
  }

  return new orderItemRepositorySpy();
};

describe("Get Order Item Usecase", () => {
  describe("With tableId", () => {
    test("Should call orderItemRepository.findAll with correct value", async () => {
      const { sut, orderItemRepositorySpy } = makeSut();

      await sut.execute({ tableId: "table_id" });
      expect(orderItemRepositorySpy.tableId).toBe("table_id");
      expect(orderItemRepositorySpy.orderItemId).toBeUndefined();
    });

    test("Should return an array of orderItems", async () => {
      const { sut } = makeSut();

      const orderItems = await sut.execute({ tableId: "table_id" });
      expect(Array.isArray(orderItems)).toBe(true);
      expect(orderItems[0]).toEqual({
        id: "any_order_item_id",
        table_id: "any_table_id",
        menu_item_id: "any_menu_item_id",
        quantity: 2,
        status: "pending",
        unit_price: "20.00",
        total_price: "40.00",
        notes: "any_notes",
      });
    });
  });

  describe("With orderItemId", () => {
    test("Should return null if orderItem is invalid", async () => {
      const { sut, orderItemRepositorySpy } = makeSut();
      orderItemRepositorySpy.orderItem = null;

      const orderItem = await sut.execute({
        tableId: "table_id",
        orderItemId: "any_order_item_id",
      });
      expect(orderItem).toBeNull();
    });

    test("Should call orderItemRepository.findById with correct value", async () => {
      const { sut, orderItemRepositorySpy } = makeSut();

      await sut.execute({
        tableId: "table_id",
        orderItemId: "any_order_item_id",
      });
      expect(orderItemRepositorySpy.tableId).toBe("table_id");
      expect(orderItemRepositorySpy.orderItemId).toBe("any_order_item_id");
    });

    test("Should return orderItem correctly", async () => {
      const { sut } = makeSut();

      const orderItem = await sut.execute({
        tableId: "table_id",
        orderItemId: "any_order_item_id",
      });
      expect(orderItem).toEqual({
        id: "any_order_item_id",
        table_id: "any_table_id",
        menu_item_id: "any_menu_item_id",
        quantity: 2,
        status: "pending",
        unit_price: "20.00",
        total_price: "40.00",
        notes: "any_notes",
      });
    });
  });

  describe("With businessId", () => {
    test("Should throw if no businessId is provided", async () => {
      const { sut } = makeSut();

      await expect(sut.execute({})).rejects.toThrow(
        new MissingParamError("businessId"),
      );
    });

    test("Should call orderItemRepository.findAllByBusinessId with correct value", async () => {
      const { sut, orderItemRepositorySpy } = makeSut();

      await sut.execute({
        businessId: "business_id",
      });
      expect(orderItemRepositorySpy.businessId).toBe("business_id");
    });

    test("Should return orderItems correctly", async () => {
      const { sut } = makeSut();

      const orderItem = await sut.execute({
        businessId: "business_id",
      });
      expect(orderItem).toEqual([
        {
          id: "any_order_item_id",
          table_id: "any_table_id",
          menu_item_id: "any_menu_item_id",
          quantity: 2,
          status: "pending",
          unit_price: "20.00",
          total_price: "40.00",
          notes: "any_notes",
        },
      ]);
    });
  });

  test("Should throw if invalid dependency is provided", async () => {
    const suts = [
      new GetOrderItemUseCase(),
      new GetOrderItemUseCase({}),
      new GetOrderItemUseCase({
        orderItemRepository: {},
      }),
    ];

    for (const sut of suts) {
      await expect(
        sut.execute({ tableId: "table_id", orderItemId: "any_order_item_id" }),
      ).rejects.toThrow(TypeError);
      await expect(sut.execute({ tableId: "table_id" })).rejects.toThrow(
        TypeError,
      );
    }
  });

  test("Should throw if dependency throws", async () => {
    const suts = [
      new GetOrderItemUseCase({
        orderItemRepository: makeOrderItemRepositoryWithError(),
      }),
    ];

    for (const sut of suts) {
      await expect(
        sut.execute({
          tableId: "any_table_id",
          orderItemId: "any_order_item_id",
        }),
      ).rejects.toThrow(new Error());
      await expect(sut.execute({ tableId: "any_table_id" })).rejects.toThrow(
        new Error(),
      );
    }
  });
});
