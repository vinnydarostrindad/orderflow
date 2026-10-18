import PaymentItemRepository from "../../../infra/repositories/payment-item-repository.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import ValidationError from "../../../utils/errors/validation-error.js";

const makeSut = () => {
  const postgresAdapterSpy = makePostgresAdapter();
  const sut = new PaymentItemRepository({
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
      if (queryObject.text.includes("order_item_id = $1")) {
        return this.paymentItemExists
          ? this.queryResult
          : {
              rows: [],
            };
      }
      return this.queryResult;
    },
  };

  postgresAdapterSpy.queryResult = {
    rows: [
      {
        id: "any_payment_item_id",
        payment_id: "any_payment_id",
        order_item_id: "any_order_item_id",
        quantity: 1,
        amount: 20,
        created_at: "any_date",
      },
    ],
  };
  postgresAdapterSpy.paymentItemExists = false;

  return postgresAdapterSpy;
};

const makePostgresAdapterWithError = () => {
  return class PostgressAdaptorSpyWithError {
    query() {
      throw new Error();
    }
  };
};

describe("PaymentItem Repository", () => {
  describe("create Method", () => {
    test("Should return payment item if everything is right", async () => {
      const { sut } = makeSut();

      const result = await sut.create({
        id: "any_payment_item_id",
        paymentId: "any_payment_id",
        orderItemId: "any_order_item_id",
        quantity: 1,
        amount: 20,
      });

      expect(result).toEqual({
        id: "any_payment_item_id",
        payment_id: "any_payment_id",
        order_item_id: "any_order_item_id",
        quantity: 1,
        amount: 20,
        created_at: "any_date",
      });
    });

    test("Should throw if no props are provided", async () => {
      const { sut } = makeSut();

      await expect(sut.create()).rejects.toThrow(new MissingParamError("id"));
    });

    test("Should throw if no id is provided", async () => {
      const { sut } = makeSut();

      const props = {
        paymentId: "any_payment_id",
        orderItemId: "any_order_item_id",
        quantity: 1,
        amount: 20,
      };

      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("id"),
      );
    });

    test("Should throw if no paymentId is provided", async () => {
      const { sut } = makeSut();

      const props = {
        id: "any_payment_item_id",
        orderItemId: "any_order_item_id",
        quantity: 1,
        amount: 20,
      };

      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("paymentId"),
      );
    });

    test("Should throw if no orderItemId is provided", async () => {
      const { sut } = makeSut();

      const props = {
        id: "any_payment_item_id",
        paymentId: "any_payment_id",
        quantity: 1,
        amount: 20,
      };

      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("orderItemId"),
      );
    });

    test("Should throw if no quantity is provided", async () => {
      const { sut } = makeSut();

      const props = {
        id: "any_payment_item_id",
        paymentId: "any_payment_id",
        orderItemId: "any_order_item_id",
        amount: 20,
      };

      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("quantity"),
      );
    });

    test("Should throw if no amount is provided", async () => {
      const { sut } = makeSut();

      const props = {
        id: "any_payment_item_id",
        paymentId: "any_payment_id",
        orderItemId: "any_order_item_id",
        quantity: 1,
      };

      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("amount"),
      );
    });

    test("Should call postgresAdapter with correct object", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      const props = {
        id: "any_payment_item_id",
        paymentId: "any_payment_id",
        orderItemId: "any_order_item_id",
        quantity: 1,
        amount: 20,
      };

      await sut.create(props);

      expect(postgresAdapterSpy.queryObject).toEqual({
        text: `
        INSERT INTO
          payment_items (id, payment_id, order_item_id, quantity, amount)
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING
          *
      ;`,
        values: [
          "any_payment_item_id",
          "any_payment_id",
          "any_order_item_id",
          1,
          20,
        ],
      });
    });

    test("Should throw if order item was already paid", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      postgresAdapterSpy.paymentItemExists = true;

      await expect(
        sut.create({
          id: "any_payment_item_id",
          paymentId: "any_payment_id",
          orderItemId: "any_order_item_id",
          quantity: 1,
          amount: 20,
        }),
      ).rejects.toThrow(
        new ValidationError({
          message: "Order item has already been paid",
          action: "No need to pay again",
        }),
      );
    });
  });

  describe("findById Method", () => {
    test("Should throw if no paymentId is provided", async () => {
      const { sut } = makeSut();

      await expect(sut.findById()).rejects.toThrow(
        new MissingParamError("paymentId"),
      );
    });

    test("Should throw if no paymentItemId is provided", async () => {
      const { sut } = makeSut();

      await expect(sut.findById("any_payment_id")).rejects.toThrow(
        new MissingParamError("paymentItemId"),
      );
    });

    test("Should call postgresAdapter with correct values", async () => {
      const { sut, postgresAdapterSpy } = makeSut();

      await sut.findById("any_payment_id", "any_payment_item_id");

      expect(postgresAdapterSpy.queryObject).toEqual({
        text: `
        SELECT
          *
        FROM
          payment_items
        WHERE
          payment_id = $1 AND id = $2
        LIMIT
          1
      ;`,
        values: ["any_payment_id", "any_payment_item_id"],
      });
    });

    test("Should return payment item correctly", async () => {
      const { sut } = makeSut();

      const paymentItem = await sut.findById(
        "any_payment_id",
        "any_payment_item_id",
      );
      expect(paymentItem).toEqual({
        id: "any_payment_item_id",
        payment_id: "any_payment_id",
        order_item_id: "any_order_item_id",
        quantity: 1,
        amount: 20,
        created_at: "any_date",
      });
    });
  });

  describe("findAllByPaymentId Method", () => {
    test("Should throw if no paymentId is provided", async () => {
      const { sut } = makeSut();

      await expect(sut.findAllByPaymentId()).rejects.toThrow(
        new MissingParamError("paymentId"),
      );
    });

    test("Should call postgresAdapter with correct values", async () => {
      const { sut, postgresAdapterSpy } = makeSut();

      await sut.findAllByPaymentId("any_payment_id");

      expect(postgresAdapterSpy.queryObject).toEqual({
        text: `
        SELECT
          *
        FROM
          payment_items
        WHERE
          payment_id = $1
      ;`,
        values: ["any_payment_id"],
      });
    });

    test("Should return payment items correctly", async () => {
      const { sut } = makeSut();

      const paymentItems = await sut.findAllByPaymentId("any_payment_id");
      expect(Array.isArray(paymentItems)).toBe(true);
      expect(paymentItems[0]).toEqual({
        id: "any_payment_item_id",
        payment_id: "any_payment_id",
        order_item_id: "any_order_item_id",
        quantity: 1,
        amount: 20,
        created_at: "any_date",
      });
    });
  });

  test("Should throw if invalid dependencies are provided", async () => {
    const suts = [
      new PaymentItemRepository(),
      new PaymentItemRepository({}),
      new PaymentItemRepository({ postgresAdapter: {} }),
    ];

    const props = {
      id: "any_payment_item_id",
      paymentId: "any_payment_id",
      orderItemId: "any_order_item_id",
      quantity: 1,
      amount: 20,
    };

    for (const sut of suts) {
      await expect(sut.create(props)).rejects.toThrow(TypeError);
      await expect(
        sut.findById("any_payment_id", "any_payment_item_id"),
      ).rejects.toThrow(TypeError);
      await expect(sut.findAllByPaymentId("any_payment_id")).rejects.toThrow(
        TypeError,
      );
    }
  });

  test("Should throw if any dependency throws", async () => {
    const sut = new PaymentItemRepository({
      postgresAdapter: makePostgresAdapterWithError(),
    });

    const props = {
      id: "any_payment_item_id",
      paymentId: "any_payment_id",
      orderItemId: "any_order_item_id",
      quantity: 1,
      amount: 20,
    };

    await expect(sut.create(props)).rejects.toThrow();
    await expect(
      sut.findById("any_payment_id", "any_payment_item_id"),
    ).rejects.toThrow();
    await expect(sut.findAllByPaymentId("any_payment_id")).rejects.toThrow();
  });
});
