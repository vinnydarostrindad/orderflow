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
      // Melhorar essa validação
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

    test("Should return null if postgresAdapter returns null", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      postgresAdapterSpy.queryResult = null;

      const table = await sut.create({
        id: "any_table_id",
        businessId: "any_business_id",
        number: "any_number",
        name: "any_name",
      });
      expect(table).toBeNull();
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
  });
});
