import MenuRepository from "../../../infra/repositories/menu-repository.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const postgresAdapterSpy = makePostgresAdapter();
  const sut = new MenuRepository({
    postgresAdapter: postgresAdapterSpy,
  });
  return {
    sut,
    postgresAdapterSpy,
  };
};

const makePostgresAdapter = () => {
  const postgresAdapterSpy = {
    query(queryObject) {
      this.queryObject = queryObject;
      return this.queryResult;
    },
  };

  postgresAdapterSpy.queryResult = {
    rows: [
      {
        id: "any_id",
        business_id: "any_business_id",
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

describe("Menu Repository", () => {
  test("Should throw if no props are provided", async () => {
    const { sut } = makeSut();
    // Fazer um erro mais específico depois
    await expect(sut.create()).rejects.toThrow(new MissingParamError("id"));
  });

  test("Should throw if no id is provided", async () => {
    const { sut } = makeSut();
    const props = {
      business_id: "any_business_id",
      name: "any_name",
    };
    await expect(sut.create(props)).rejects.toThrow(
      new MissingParamError("id"),
    );
  });

  test("Should throw if no business_id is provided", async () => {
    const { sut } = makeSut();
    const props = {
      id: "any_id",
      name: "any_name",
    };
    await expect(sut.create(props)).rejects.toThrow(
      new MissingParamError("business_id"),
    );
  });

  test("Should throw if no name is provided", async () => {
    const { sut } = makeSut();
    const props = {
      id: "any_id",
      business_id: "any_business_id",
    };
    await expect(sut.create(props)).rejects.toThrow(
      new MissingParamError("name"),
    );
  });

  test("Should call postgresAdapter with correct object ", async () => {
    const { sut, postgresAdapterSpy } = makeSut();
    const props = {
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
    };
    await sut.create(props);
    expect(postgresAdapterSpy.queryObject).toEqual({
      text: `
        INSERT INTO
          menus (id, business_id, name)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
      ;`,
      values: ["any_id", "any_business_id", "any_name"],
    });
  });

  test("Should return null if postgresAdapter return invalid business", async () => {
    const { sut, postgresAdapterSpy } = makeSut();
    const props = {
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
    };
    postgresAdapterSpy.queryResult = null;

    const menu = await sut.create(props);
    expect(menu).toBeNull();
  });

  test("Should return menu if everything is right", async () => {
    const { sut } = makeSut();
    const props = {
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
    };

    const menu = await sut.create(props);
    expect(menu).toEqual({
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
    });
  });

  test("Should throw if invalid dependencies are provided", async () => {
    const suts = [
      new MenuRepository(),
      new MenuRepository({}),
      new MenuRepository({
        postgresAdapter: {},
      }),
    ];
    const props = {
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
    };

    for (const sut of suts) {
      await expect(sut.create(props)).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if any dependency throws", async () => {
    const suts = [
      new MenuRepository({
        postgresAdapter: makePostgresAdapterWithError(),
      }),
    ];
    const props = {
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
    };

    for (const sut of suts) {
      await expect(sut.create(props)).rejects.toThrow();
    }
  });
});
