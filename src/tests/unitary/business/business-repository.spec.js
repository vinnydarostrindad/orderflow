import BusinessRepository from "../../../infra/repositories/business-repository.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import ValidationError from "../../../utils/errors/validation-error.js";

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

      if (
        this.queryObject.values[0] === "any_name" ||
        this.queryObject.values[0] === "repeated_name"
      ) {
        return this.validateUniqueNameQueryResult;
      } else if (
        this.queryObject.values[0] === "any_email@mail.com" ||
        this.queryObject.values[0] === "repeated_email@mail.com"
      ) {
        return this.validateUniqueEmailQueryResult;
      }

      return this.queryResult;
    },
  };

  postgresAdapterSpy.queryResult = {
    rows: [
      {
        id: "any_id",
        name: "any_name",
        email: "any_email@mail.com",
        hashedPassword: "any_hash",
      },
    ],
  };
  postgresAdapterSpy.validateUniqueNameQueryResult = {
    rows: [],
  };
  postgresAdapterSpy.validateUniqueEmailQueryResult = {
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

describe("Business Repository", () => {
  describe("create Method", () => {
    test("Should throw if no props are provided", async () => {
      const { sut } = makeSut();

      await expect(sut.create()).rejects.toThrow(new MissingParamError("id"));
    });

    test("Should throw if no id is provided", async () => {
      const { sut } = makeSut();
      const props = {
        name: "any_name",
        email: "any_email@mail.com",
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
        email: "any_email@mail.com",
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
        email: "any_email@mail.com",
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
        email: "any_email@mail.com",
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
        values: ["any_id", "any_name", "any_email@mail.com", "any_hash"],
      });
    });

    test("Should return business if everything is right", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_id",
        name: "any_name",
        email: "any_email@mail.com",
        hashedPassword: "any_hash",
      };

      const business = await sut.create(props);
      expect(business).toEqual({
        id: "any_id",
        name: "any_name",
        email: "any_email@mail.com",
        hashedPassword: "any_hash",
      });
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

    test("Should return business if everything is right", async () => {
      const { sut } = makeSut();

      const business = await sut.findById("any_id");
      expect(business).toEqual({
        id: "any_id",
        name: "any_name",
        email: "any_email@mail.com",
        hashedPassword: "any_hash",
      });
    });
  });

  describe("valideUniqueName method", () => {
    test("Should throw if no name is provided", async () => {
      const { sut } = makeSut();

      await expect(sut.validateUniqueName()).rejects.toThrow(
        new MissingParamError("name"),
      );
    });

    test("Should throw if rows length is bigger than 0", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      postgresAdapterSpy.validateUniqueNameQueryResult.rows = [{}];

      await expect(sut.validateUniqueName("repeated_name")).rejects.toThrow(
        new ValidationError({
          message: "The name provided is already in use.",
          action: "Use another name to perform this operation.",
        }),
      );
    });
  });

  describe("valideUniqueEmail method", () => {
    test("Should throw if no name is provided", async () => {
      const { sut } = makeSut();

      await expect(sut.validateUniqueEmail()).rejects.toThrow(
        new MissingParamError("email"),
      );
    });

    test("Should throw if rows length is bigger than 0", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      postgresAdapterSpy.validateUniqueEmailQueryResult.rows = [{}];

      await expect(
        sut.validateUniqueEmail("repeated_email@mail.com"),
      ).rejects.toThrow(
        new ValidationError({
          message: "The email provided is already in use.",
          action: "Use another email to perform this operation.",
        }),
      );
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
      email: "any_email@mail.com",
      hashedPassword: "any_hash",
    };

    for (const sut of suts) {
      await expect(sut.create(props)).rejects.toThrow(TypeError);
      await expect(sut.findById(props.id)).rejects.toThrow(TypeError);
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
      email: "any_email@mail.com",
      hashedPassword: "any_hash",
    };

    for (const sut of suts) {
      await expect(sut.create(props)).rejects.toThrow();
      await expect(sut.findById(props.id)).rejects.toThrow();
    }
  });
});
