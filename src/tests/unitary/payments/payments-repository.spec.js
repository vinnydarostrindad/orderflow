import PaymentRepository from "../../../infra/repositories/payment-repository";
import MissingParamError from "../../../utils/errors/missing-param-error";

const makeSut = () => {
  const postgresAdapterSpy = makePostgresAdapter();
  const sut = new PaymentRepository({
    postgresAdapter: postgresAdapterSpy,
  });

  return {
    sut,
    postgresAdapterSpy,
  };
};

const makePostgresAdapter = () => {
  class PostgressAdaptorSpy {
    async query(queryObject) {
      this.queryObject = queryObject;
      return this.result;
    }
  }

  const postgressAdaptorSpy = new PostgressAdaptorSpy();
  postgressAdaptorSpy.result = {
    rows: [
      {
        id: "any_id",
        table_session_id: "any_table_session_id",
        method: "pix",
        amount: 100,
        status: "completed",
      },
    ],
  };
  return postgressAdaptorSpy;
};

const makePostgresAdapterWithError = () => {
  return class PostgressAdaptorSpyWithError {
    query() {
      throw new Error();
    }
  };
};

describe("Payments Repository", () => {
  describe("create method", () => {
    test("Should return created payment correctly", async () => {
      const { sut } = makeSut();

      const props = {
        id: "any_id",
        tableSessionId: "any_table_session_id",
        method: "pix",
        amount: 100,
      };

      const result = await sut.create(props);

      expect(result).toEqual({
        id: "any_id",
        table_session_id: "any_table_session_id",
        method: "pix",
        amount: 100,
        status: "completed",
      });
    });

    test("Should return MissinParamError if no props are provided", async () => {
      const { sut } = makeSut();

      await expect(sut.create()).rejects.toThrow(new MissingParamError("id"));
    });

    test("Should return MissinParamError if no id is provided", async () => {
      const { sut } = makeSut();

      const props = {
        tableSessionId: "any_table_session_id",
        method: "pix",
        amount: 100,
      };

      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("id"),
      );
    });

    test("Should return MissinParamError if no tableSessionId is provided", async () => {
      const { sut } = makeSut();

      const props = {
        id: "any_id",
        method: "pix",
        amount: 100,
      };

      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("tableSessionId"),
      );
    });

    test("Should return MissinParamError if no method is provided", async () => {
      const { sut } = makeSut();

      const props = {
        id: "any_id",
        tableSessionId: "any_table_session_id",
        amount: 100,
      };

      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("method"),
      );
    });

    test("Should return MissinParamError if no amount is provided", async () => {
      const { sut } = makeSut();

      const props = {
        id: "any_id",
        tableSessionId: "any_table_session_id",
        method: "pix",
      };

      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("amount"),
      );
    });

    test("Should call postgresAdapter with correct object", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      const props = {
        id: "any_id",
        tableSessionId: "any_table_session_id",
        method: "pix",
        amount: 100,
      };

      await sut.create(props);

      expect(postgresAdapterSpy.queryObject).toEqual({
        text: `
        INSERT INTO
          payments (id, tableSessionId, method, amount)
        VALUES
          ($1, $2, $3, $4)
        RETURNING
          *
      `,
        values: [props.id, props.tableSessionId, props.method, props.amount],
      });
    });
  });

  test("Should throw if invalid dependencies are provided", async () => {
    const suts = [
      new PaymentRepository(),
      new PaymentRepository({}),
      new PaymentRepository({
        postgresAdapter: makePostgresAdapterWithError(),
      }),
    ];

    const props = {
      id: "any_id",
      tableSessionId: "any_table_session_id",
      method: "pix",
      amount: 100,
    };

    for (const sut of suts) {
      await expect(sut.create(props)).rejects.toThrow(TypeError);
    }
  });
});
