import TableRepository from "../../../infra/repositories/table-repository.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const postgresAdapterSpy = makePostgresAdapter();
  const sut = new TableRepository({
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
      if (queryObject.values[1] == "any_number") {
        return this.validateUniqueQueryResult;
      }
      return this.queryResult;
    },
  };

  postgresAdapterSpy.queryResult = {
    rows: [
      {
        id: "any_table_id",
        business_id: "any_business_id",
        number: "any_number",
        name: "any_name",
      },
    ],
  };
  postgresAdapterSpy.validateUniqueQueryResult = {
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

describe("Table Repository", () => {
  describe("create Method", () => {
    test("Should throw if no props are provided", async () => {
      const { sut } = makeSut();

      await expect(sut.create()).rejects.toThrow(new MissingParamError("id"));
    });

    test("Should throw if no id is provided", async () => {
      const { sut } = makeSut();
      const props = {
        businessId: "any_business_id",
        number: "any_number",
        name: "any_name",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("id"),
      );
    });

    test("Should throw if no businessId is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_table_id",
        number: "any_number",
        name: "any_name",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("businessId"),
      );
    });

    test("Should throw if no number is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_table_id",
        businessId: "any_business_id",
        name: "any_name",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("number"),
      );
    });

    test("Should call postgresAdapter with correct object", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      const props = {
        id: "any_table_id",
        businessId: "any_business_id",
        number: "any_number",
        name: "any_name",
      };
      await sut.create(props);
      expect(postgresAdapterSpy.queryObject).toEqual({
        text: `
        INSERT INTO
          tables (id, business_id, number, name)
        VALUES 
          ($1, $2, $3, $4)
        RETURNING
          *
      `,
        values: ["any_table_id", "any_business_id", "any_number", "any_name"],
      });
    });

    test("Should return table if everything is right", async () => {
      const { sut } = makeSut();
      const table = await sut.create({
        id: "any_table_id",
        businessId: "any_business_id",
        number: "any_number",
        name: "any_name",
      });
      expect(table).toEqual({
        id: "any_table_id",
        business_id: "any_business_id",
        number: "any_number",
        name: "any_name",
      });
    });
  });

  describe("findAll Method", () => {
    test("Should throw if no businessId is provided", async () => {
      const { sut } = makeSut();

      await expect(sut.findAll()).rejects.toThrow(
        new MissingParamError("businessId"),
      );
    });

    test("Should call postgresAdapter with correct object", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      await sut.findAll("any_business_id");
      expect(postgresAdapterSpy.queryObject).toEqual({
        text: `
        SELECT
          *
        FROM
          tables
        WHERE
          business_id = $1
        LIMIT
          10
      `,
        values: ["any_business_id"],
      });
    });

    test("Should return tables if everything is right", async () => {
      const { sut } = makeSut();
      const tables = await sut.findAll("any_business_id");
      expect(Array.isArray(tables)).toBe(true);
      expect(tables[0]).toEqual({
        id: "any_table_id",
        business_id: "any_business_id",
        number: "any_number",
        name: "any_name",
      });
    });
  });

  describe("findById Method", () => {
    test("Should throw if no businessId is provided", async () => {
      const { sut } = makeSut();
      await expect(sut.findById(undefined, "any_table_id")).rejects.toThrow(
        new MissingParamError("businessId"),
      );
    });

    test("Should throw if no tableId is provided", async () => {
      const { sut } = makeSut();
      await expect(sut.findById("any_business_id")).rejects.toThrow(
        new MissingParamError("tableId"),
      );
    });

    test("Should call postgresAdapter with correct object", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      await sut.findById("any_business_id", "any_table_id");
      expect(postgresAdapterSpy.queryObject).toEqual({
        text: `
        SELECT
          *
        FROM
          tables
        WHERE
          id = $1 AND business_id = $2
        LIMIT
          1
      `,
        values: ["any_table_id", "any_business_id"],
      });
    });

    test("Should return table if everything is right", async () => {
      const { sut } = makeSut();
      const table = await sut.findById("any_business_id", "any_table_id");
      expect(table).toEqual({
        id: "any_table_id",
        business_id: "any_business_id",
        number: "any_number",
        name: "any_name",
      });
    });
  });

  test("Should throw if invalid dependencies are provided", async () => {
    const suts = [
      new TableRepository(),
      new TableRepository({}),
      new TableRepository({ postgresAdapter: {} }),
    ];

    const props = {
      id: "any_table_id",
      businessId: "any_business_id",
      number: "any_number",
      name: "any_name",
    };

    for (const sut of suts) {
      await expect(sut.create(props)).rejects.toThrow(TypeError);
      await expect(sut.findAll(props.businessId)).rejects.toThrow(TypeError);
      await expect(sut.findById(props.businessId, props.id)).rejects.toThrow(
        TypeError,
      );
    }
  });

  test("Should throw if any dependency throws", async () => {
    const sut = new TableRepository({
      postgresAdapter: makePostgresAdapterWithError(),
    });

    const props = {
      id: "any_table_id",
      businessId: "any_business_id",
      number: "any_number",
      name: "any_name",
    };

    await expect(sut.create(props)).rejects.toThrow();
    await expect(sut.findAll(props.businessId)).rejects.toThrow();
    await expect(sut.findById(props.businessId, props.id)).rejects.toThrow();
  });
});
