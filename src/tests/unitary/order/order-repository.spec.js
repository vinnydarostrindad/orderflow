import OrderRepository from "../../../infra/repositories/order-repository.js";
import ValidationError from "../../../utils/errors/validation-error.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makePostgresAdapter = () => {
  const postgresAdapterSpy = {
    async query(queryObject) {
      this.queryObject = queryObject;
      if (
        this.queryObject.values[1] === "any_table_number" ||
        this.queryObject.values[1] === "repeated_table_number"
      ) {
        return this.validateUniqueTableNumberQueryResult;
      }
      return this.queryResult;
    },
  };

  postgresAdapterSpy.queryResult = {
    rows: [
      {
        id: "any_order_id",
        business_id: "any_business_id",
        table_id: "any_table_id",
        table_number: "any_table_number",
        status: "pending",
      },
    ],
  };
  postgresAdapterSpy.validateUniqueTableNumberQueryResult = {
    rows: [],
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

const makeSut = () => {
  const postgresAdapterSpy = makePostgresAdapter();
  const sut = new OrderRepository({ postgresAdapter: postgresAdapterSpy });
  return {
    sut,
    postgresAdapterSpy,
  };
};

describe("OrderRepository", () => {
  describe("create method", () => {
    test("Should throw if no props are provided", async () => {
      const { sut } = makeSut();
      await expect(sut.create()).rejects.toThrow(new MissingParamError("id"));
    });

    test("Should throw if no id is provided", async () => {
      const { sut } = makeSut();
      const props = {
        businessId: "any_business_id",
        tableId: "any_table_id",
        tableNumber: "any_table_number",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("id"),
      );
    });

    test("Should throw if no businessId is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_order_id",
        tableId: "any_table_id",
        tableNumber: "any_table_number",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("businessId"),
      );
    });

    test("Should throw if no tableId is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_order_id",
        businessId: "any_business_id",
        tableNumber: "any_table_number",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("tableId"),
      );
    });

    test("Should throw if no tableNumber is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_order_id",
        businessId: "any_business_id",
        tableId: "any_table_id",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("tableNumber"),
      );
    });

    test("Should call postgresAdapter with correct object", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      const props = {
        id: "any_order_id",
        businessId: "any_business_id",
        tableId: "any_table_id",
        tableNumber: "any_table_number",
      };

      await sut.create(props);

      expect(postgresAdapterSpy.queryObject).toEqual({
        text: `
        INSERT INTO
          orders (id, business_id, table_id, table_number)
        VALUES
          ($1, $2, $3, $4)
        RETURNING
          *
      ;`,
        values: [
          "any_order_id",
          "any_business_id",
          "any_table_id",
          "any_table_number",
        ],
      });
    });

    test("Should return order if everything is correct", async () => {
      const { sut } = makeSut();
      const result = await sut.create({
        id: "any_order_id",
        businessId: "any_business_id",
        tableId: "any_table_id",
        tableNumber: "any_table_number",
      });

      expect(result).toEqual({
        id: "any_order_id",
        business_id: "any_business_id",
        table_id: "any_table_id",
        table_number: "any_table_number",
        status: "pending",
      });
    });
  });
  describe("findAll method", () => {
    test("Should throw if no tableId is provided", async () => {
      const { sut } = makeSut();
      await expect(sut.findAll()).rejects.toThrow(
        new MissingParamError("tableId"),
      );
    });

    test("Should call postgresAdapter with correct query", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      await sut.findAll("any_table_id");

      expect(postgresAdapterSpy.queryObject).toEqual({
        text: `
        SELECT
          *
        FROM
          orders
        WHERE
          table_id = $1
        LIMIT
          10
      ;`,
        values: ["any_table_id"],
      });
    });

    test("Should return list of orders", async () => {
      const { sut } = makeSut();
      const result = await sut.findAll("any_table_id");

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toEqual({
        id: "any_order_id",
        business_id: "any_business_id",
        table_id: "any_table_id",
        table_number: "any_table_number",
        status: "pending",
      });
    });
  });

  describe("findById method", () => {
    test("Should throw if no tableId is provided", async () => {
      const { sut } = makeSut();
      await expect(sut.findById(undefined, "any_order_id")).rejects.toThrow(
        new MissingParamError("tableId"),
      );
    });

    test("Should throw if no orderId is provided", async () => {
      const { sut } = makeSut();
      await expect(sut.findById("any_table_id")).rejects.toThrow(
        new MissingParamError("orderId"),
      );
    });

    test("Should call postgresAdapter with correct query", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      await sut.findById("any_table_id", "any_order_id");

      expect(postgresAdapterSpy.queryObject).toEqual({
        text: `
        SELECT
          *
        FROM
          orders
        WHERE
          id = $1 AND table_id = $2
        LIMIT
          1
        ;`,
        values: ["any_order_id", "any_table_id"],
      });
    });

    test("Should return order if found", async () => {
      const { sut } = makeSut();
      const result = await sut.findById("any_table_id", "any_order_id");

      expect(result).toEqual({
        id: "any_order_id",
        business_id: "any_business_id",
        table_id: "any_table_id",
        table_number: "any_table_number",
        status: "pending",
      });
    });
  });

  describe("valideUniqueTableNumber method", () => {
    test("Should throw if no businessId is provided", async () => {
      const { sut } = makeSut();

      await expect(sut.validateUniqueTableNumber()).rejects.toThrow(
        new MissingParamError("businessId"),
      );
    });

    test("Should throw if no tableNumber is provided", async () => {
      const { sut } = makeSut();

      await expect(
        sut.validateUniqueTableNumber("any_business_id"),
      ).rejects.toThrow(new MissingParamError("tableNumber"));
    });

    test("Should throw rows if length is bigger than 0", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      postgresAdapterSpy.validateUniqueTableNumberQueryResult.rows = [{}];

      await expect(
        sut.validateUniqueTableNumber(
          "any_business_id",
          "repeated_table_number",
        ),
      ).rejects.toThrow(
        new ValidationError({
          message: "The table number provided is already in use.",
          action: "Use another table number to perform this operation.",
        }),
      );
    });
  });

  test("Should throw if invalid dependencies are provided", async () => {
    const suts = [
      new OrderRepository(),
      new OrderRepository({}),
      new OrderRepository({ postgresAdapter: {} }),
    ];

    const props = {
      id: "any_order_id",
      businessId: "any_business_id",
      tableId: "any_table_id",
      tableNumber: "repeated",
    };

    for (const sut of suts) {
      await expect(sut.create(props)).rejects.toThrow(TypeError);
      await expect(sut.findAll(props.tableId)).rejects.toThrow(TypeError);
      await expect(sut.findById(props.tableId, props.id)).rejects.toThrow(
        TypeError,
      );
    }
  });

  test("Should throw if dependency throws", async () => {
    const sut = new OrderRepository({
      postgresAdapter: makePostgresAdapterWithError(),
    });

    const props = {
      id: "any_order_id",
      businessId: "any_business_id",
      tableId: "any_table_id",
      tableNumber: "any_table_number",
    };

    await expect(sut.create(props)).rejects.toThrow();
    await expect(sut.findAll(props.tableId)).rejects.toThrow();
    await expect(sut.findById(props.tableId, props.id)).rejects.toThrow();
  });
});
