import BusinessRepository from "../../../infra/repositories/business-repository.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const postgresAdapterSpy = makePostgresAdapter();
  const sut = new BusinessRepository({
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
        id: "any_id",
        name: "any_name",
        email: "any_email",
        hashedPassword: "any_hash",
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

describe("Business Repository", () => {
  describe("create Method", () => {
    test("Should throw if no props are provided", async () => {
      const { sut } = makeSut();

      // Fazer um erro mais específico depois
      await expect(sut.create()).rejects.toThrow(new MissingParamError("id"));
    });

    test("Should throw if no id is provided", async () => {
      const { sut } = makeSut();
      const props = {
        name: "any_name",
        email: "any_email",
        hashedPassword: "any_hash",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("id"),
      );
    });

    test("Should throw if no name is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_id",
        email: "any_email",
        hashedPassword: "any_hash",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("name"),
      );
    });

    test("Should throw if no email is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_id",
        name: "any_name",
        hashedPassword: "any_hash",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("email"),
      );
    });

    test("Should throw if no hashedPassword is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_id",
        name: "any_name",
        email: "any_email",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("hashedPassword"),
      );
    });

    test("Should call postgresAdapter with correct object ", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      const props = {
        id: "any_id",
        name: "any_name",
        email: "any_email",
        hashedPassword: "any_hash",
      };
      await sut.create(props);
      expect(postgresAdapterSpy.queryObject).toEqual({
        text: `
        INSERT INTO
          businesses (id, name, email, password)
        VALUES
          ($1, $2, $3, $4)
        RETURNING
          *
      ;`,
        values: ["any_id", "any_name", "any_email", "any_hash"],
      });
    });

    test("Should return null if postgresAdapter return invalid business", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      const props = {
        id: "any_id",
        name: "any_name",
        email: "any_email",
        hashedPassword: "any_hash",
      };
      postgresAdapterSpy.queryResult = null;
      const business = await sut.create(props);
      expect(business).toBeNull();
    });

    test("Should return business if everything is right", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_id",
        name: "any_name",
        email: "any_email",
        hashedPassword: "any_hash",
      };

      const business = await sut.create(props);
      expect(business).toEqual({
        id: "any_id",
        name: "any_name",
        email: "any_email",
        hashedPassword: "any_hash",
      });
    });

    test("Should throw if invalid dependencies are provided", async () => {
      const suts = [
        new BusinessRepository(),
        new BusinessRepository({}),
        new BusinessRepository({
          postgresAdapter: {},
        }),
      ];
      const props = {
        id: "any_id",
        name: "any_name",
        email: "any_email",
        hashedPassword: "any_hash",
      };

      for (const sut of suts) {
        await expect(sut.create(props)).rejects.toThrow(TypeError);
      }
    });

    test("Should throw if any dependency throws", async () => {
      const suts = [
        new BusinessRepository({
          postgresAdapter: makePostgresAdapterWithError(),
        }),
      ];
      const props = {
        id: "any_id",
        name: "any_name",
        email: "any_email",
        hashedPassword: "any_hash",
      };

      for (const sut of suts) {
        await expect(sut.create(props)).rejects.toThrow();
      }
    });
  });

  describe("findById Method", () => {
    test("Should throw if no id is provided", async () => {
      const { sut } = makeSut();

      await expect(sut.findById()).rejects.toThrow(new MissingParamError("id"));
    });

    test("Should call postgresAdapter with correct object ", async () => {
      const { sut, postgresAdapterSpy } = makeSut();

      await sut.findById("any_id");
      expect(postgresAdapterSpy.queryObject).toEqual({
        text: `
        SELECT
          *
        FROM
          businesses
        WHERE
          id = $1
        LIMIT
          1
      ;`,
        values: ["any_id"],
      });
    });

    test("Should return null if postgresAdapter return invalid business", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      postgresAdapterSpy.queryResult = null;

      const business = await sut.findById("any_id");
      expect(business).toBeNull();
    });

    test("Should return business if everything is right", async () => {
      const { sut } = makeSut();

      const business = await sut.findById("any_id");
      expect(business).toEqual({
        id: "any_id",
        name: "any_name",
        email: "any_email",
        hashedPassword: "any_hash",
      });
    });

    test("Should throw if invalid dependencies are provided", async () => {
      const suts = [
        new BusinessRepository(),
        new BusinessRepository({}),
        new BusinessRepository({
          postgresAdapter: {},
        }),
      ];

      for (const sut of suts) {
        await expect(sut.findById("any_id")).rejects.toThrow(TypeError);
      }
    });

    test("Should throw if any dependency throws", async () => {
      const suts = [
        new BusinessRepository({
          postgresAdapter: makePostgresAdapterWithError(),
        }),
      ];

      for (const sut of suts) {
        await expect(sut.findById("any_id")).rejects.toThrow();
      }
    });
  });
});
