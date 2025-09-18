import OrderItemRepository from "../../../infra/repositories/order-item-repository.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const postgresAdapterSpy = makePostgresAdapter();
  const sut = new OrderItemRepository({
    postgresAdapter: postgresAdapterSpy,
  });
  return {
    sut,
    postgresAdapterSpy,
  };
};

const makePostgresAdapter = () => {
  const postgresAdapterSpy = {
    async query(queryObject) {
      this.queryObject = queryObject;
      return this.queryResult;
    },
  };

  postgresAdapterSpy.queryResult = {
    rows: [
      {
        id: "any_order_item_id",
        order_id: "any_order_id",
        menu_item_id: "any_menu_item_id",
        quantity: 2,
        unit_price: 20,
        total_price: 40,
        notes: "any_notes",
      },
    ],
  };
  return postgresAdapterSpy;
};

const makePostgresAdapterWithError = () => {
  return {
    query() {
      throw new Error();
    },
  };
};

describe("OrderItem Repository", () => {
  describe("create Method", () => {
    test("Should return order item if everything is right", async () => {
      const { sut } = makeSut();
      const result = await sut.create({
        id: "any_order_item_id",
        orderId: "any_order_id",
        menuItemId: "any_menu_item_id",
        quantity: 2,
        unitPrice: 20,
        totalPrice: 40,
        notes: "any_notes",
      });
      expect(result).toEqual({
        id: "any_order_item_id",
        order_id: "any_order_id",
        menu_item_id: "any_menu_item_id",
        quantity: 2,
        unit_price: 20,
        total_price: 40,
        notes: "any_notes",
      });
    });

    test("Should throw if no props are provided", async () => {
      const { sut } = makeSut();

      await expect(sut.create()).rejects.toThrow(new MissingParamError("id"));
    });

    test("Should throw if no id is provided", async () => {
      const { sut } = makeSut();
      const props = {
        orderId: "any_order_id",
        menuItemId: "any_menu_item_id",
        quantity: 2,
        unitPrice: 20,
        totalPrice: 40,
        notes: "any_notes",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("id"),
      );
    });

    test("Should throw if no orderId is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_order_item_id",
        menuItemId: "any_menu_item_id",
        quantity: 2,
        unitPrice: 20,
        totalPrice: 40,
        notes: "any_notes",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("orderId"),
      );
    });

    test("Should throw if no menuItemId is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_order_item_id",
        orderId: "any_order_id",
        quantity: 2,
        unitPrice: 20,
        totalPrice: 40,
        notes: "any_notes",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("menuItemId"),
      );
    });

    test("Should throw if no quantity is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_order_item_id",
        orderId: "any_order_id",
        menuItemId: "any_menu_item_id",
        unitPrice: 20,
        totalPrice: 40,
        notes: "any_notes",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("quantity"),
      );
    });

    test("Should throw if no unitPrice is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_order_item_id",
        orderId: "any_order_id",
        menuItemId: "any_menu_item_id",
        quantity: 2,
        totalPrice: 40,
        notes: "any_notes",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("unitPrice"),
      );
    });

    test("Should throw if no totalPrice is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_order_item_id",
        orderId: "any_order_id",
        menuItemId: "any_menu_item_id",
        quantity: 2,
        unitPrice: 20,
        notes: "any_notes",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("totalPrice"),
      );
    });

    test("Should call postgresAdapter with correct object", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      const props = {
        id: "any_order_item_id",
        orderId: "any_order_id",
        menuItemId: "any_menu_item_id",
        quantity: 2,
        unitPrice: 20,
        totalPrice: 40,
        notes: "any_notes",
      };
      await sut.create(props);
      expect(postgresAdapterSpy.queryObject).toEqual({
        text: `
        INSERT INTO
          order_items (id, order_id, menu_item_id, quantity, unit_price, total_price, notes)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
          *
      ;`,
        values: [
          "any_order_item_id",
          "any_order_id",
          "any_menu_item_id",
          2,
          20,
          40,
          "any_notes",
        ],
      });
    });
  });

  describe("findAll Method", () => {
    test("Should throw if no orderId is provided", async () => {
      const { sut } = makeSut();
      await expect(sut.findAll()).rejects.toThrow(
        new MissingParamError("orderId"),
      );
    });

    test("Should call postgresAdapter with correct object", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      await sut.findAll("any_order_id");
      expect(postgresAdapterSpy.queryObject).toEqual({
        text: `
        SELECT 
          *
        FROM
          order_items
        WHERE
          order_id = $1
        LIMIT
          10
      ;`,
        values: ["any_order_id"],
      });
    });

    test("Should return order items if everything is right", async () => {
      const { sut } = makeSut();
      const result = await sut.findAll("any_order_id");
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toEqual({
        id: "any_order_item_id",
        order_id: "any_order_id",
        menu_item_id: "any_menu_item_id",
        quantity: 2,
        unit_price: 20,
        total_price: 40,
        notes: "any_notes",
      });
    });
  });

  describe("findAllByBusinessId Method", () => {
    test("Should throw if no businessId is provided", async () => {
      const { sut } = makeSut();
      await expect(sut.findAllByBusinessId()).rejects.toThrow(
        new MissingParamError("businessId"),
      );
    });

    test("Should call postgresAdapter with correct query when no filter is provided", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      await sut.findAllByBusinessId("any_business_id");
      expect(postgresAdapterSpy.queryObject.text).toContain(
        "WHERE\n          orders.business_id = $1 ",
      );
    });

    test("Should return order items if everything is right", async () => {
      const { sut } = makeSut();
      const result = await sut.findAllByBusinessId("any_business_id");
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toEqual({
        id: "any_order_item_id",
        order_id: "any_order_id",
        menu_item_id: "any_menu_item_id",
        quantity: 2,
        unit_price: 20,
        total_price: 40,
        notes: "any_notes",
      });
    });

    describe("Filters", () => {
      test("Should add correct filter when period=day", async () => {
        const { sut, postgresAdapterSpy } = makeSut();
        await sut.findAllByBusinessId("any_business_id", "day");
        expect(postgresAdapterSpy.queryObject.text).toContain(
          "AND order_items.created_at >= date_trunc('day', CURRENT_DATE)",
        );
      });

      test("Should add correct filter when period=week", async () => {
        const { sut, postgresAdapterSpy } = makeSut();
        await sut.findAllByBusinessId("any_business_id", "week");
        expect(postgresAdapterSpy.queryObject.text).toContain(
          "AND order_items.created_at >= date_trunc('week', CURRENT_DATE)",
        );
        expect(postgresAdapterSpy.queryObject.text).toContain(
          "AND order_items.created_at < date_trunc('week', CURRENT_DATE) + INTERVAL '1 week'",
        );
      });

      test("Should add correct filter when period=month", async () => {
        const { sut, postgresAdapterSpy } = makeSut();
        await sut.findAllByBusinessId("any_business_id", "month");
        expect(postgresAdapterSpy.queryObject.text).toContain(
          "AND order_items.created_at >= date_trunc('month', CURRENT_DATE)",
        );
        expect(postgresAdapterSpy.queryObject.text).toContain(
          "AND order_items.created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'",
        );
      });

      test("Should add correct filter when period=6month", async () => {
        const { sut, postgresAdapterSpy } = makeSut();
        await sut.findAllByBusinessId("any_business_id", "6month");
        expect(postgresAdapterSpy.queryObject.text).toContain(
          "AND order_items.created_at >= date_trunc('day', CURRENT_DATE) - INTERVAL '6 months'",
        );
      });

      test("Should add correct filter when period=year", async () => {
        const { sut, postgresAdapterSpy } = makeSut();
        await sut.findAllByBusinessId("any_business_id", "year");
        expect(postgresAdapterSpy.queryObject.text).toContain(
          "AND order_items.created_at >= date_trunc('year', CURRENT_DATE)",
        );
        expect(postgresAdapterSpy.queryObject.text).toContain(
          "AND order_items.created_at < date_trunc('year', CURRENT_DATE) + INTERVAL '1 year'",
        );
      });
    });
  });

  describe("findById Method", () => {
    test("Should throw if no orderId is provided", async () => {
      const { sut } = makeSut();
      await expect(
        sut.findById(undefined, "any_order_item_id"),
      ).rejects.toThrow(new MissingParamError("orderId"));
    });

    test("Should throw if no orderItemId is provided", async () => {
      const { sut } = makeSut();
      await expect(sut.findById("any_order_id")).rejects.toThrow(
        new MissingParamError("orderItemId"),
      );
    });

    test("Should call postgresAdapter with correct object", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      await sut.findById("any_order_id", "any_order_item_id");
      expect(postgresAdapterSpy.queryObject).toEqual({
        text: `
        SELECT
          *
        FROM
          order_items
        WHERE
          id = $1 AND order_id = $2
        LIMIT
          1
        ;`,
        values: ["any_order_item_id", "any_order_id"],
      });
    });

    test("Should return order item if everything is right", async () => {
      const { sut } = makeSut();
      const result = await sut.findById("any_order_id", "any_order_item_id");
      expect(result).toEqual({
        id: "any_order_item_id",
        order_id: "any_order_id",
        menu_item_id: "any_menu_item_id",
        quantity: 2,
        unit_price: 20,
        total_price: 40,
        notes: "any_notes",
      });
    });
  });

  test("Should throw if invalid dependencies are provided", async () => {
    const suts = [
      new OrderItemRepository(),
      new OrderItemRepository({}),
      new OrderItemRepository({ postgresAdapter: {} }),
    ];
    const props = {
      id: "any_order_item_id",
      orderId: "any_order_id",
      menuItemId: "any_menu_item_id",
      quantity: 2,
      unitPrice: 20,
      totalPrice: 40,
    };

    for (const sut of suts) {
      await expect(sut.create(props)).rejects.toThrow(TypeError);
      await expect(sut.findAll(props.orderId)).rejects.toThrow(TypeError);
      await expect(sut.findById(props.orderId, props.id)).rejects.toThrow(
        TypeError,
      );
    }
  });

  test("Should throw if any dependency throws", async () => {
    const sut = new OrderItemRepository({
      postgresAdapter: makePostgresAdapterWithError(),
    });
    const props = {
      id: "any_order_item_id",
      orderId: "any_order_id",
      menuItemId: "any_menu_item_id",
      quantity: 2,
      unitPrice: 20,
      totalPrice: 40,
    };

    await expect(sut.create(props)).rejects.toThrow();
    await expect(sut.findAll(props.orderId)).rejects.toThrow();
    await expect(sut.findById(props.orderId, props.id)).rejects.toThrow();
  });
});
