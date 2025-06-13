import OrderRepository from "../../../infra/repositories/order-repository.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

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
        id: "any_order_id",
        business_id: "any_business_id",
        table_id: "any_table_id",
        table_number: "any_table_number",
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
      // Fazer uma validação melhor
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

    test("Should return null if postgresAdapter returns invalid result", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      const props = {
        id: "any_order_id",
        businessId: "any_business_id",
        tableId: "any_table_id",
        tableNumber: "any_table_number",
      };
      postgresAdapterSpy.queryResult = null;

      const result = await sut.create(props);
      expect(result).toBeNull();
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
      });
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
      tableNumber: "any_table_number",
    };

    for (const sut of suts) {
      await expect(sut.create(props)).rejects.toThrow(TypeError);
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
  });
});
