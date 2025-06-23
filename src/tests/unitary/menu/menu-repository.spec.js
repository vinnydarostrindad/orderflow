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
    async query(queryObject) {
      this.queryObject = queryObject;
      if (queryObject.values[1] === "any_name") {
        return this.validateUniqueQueryResult;
      }

      return this.queryResult;
    },
  };

  postgresAdapterSpy.queryResult = {
    rows: [
      {
        id: "any_menu_id",
        business_id: "any_business_id",
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

describe("Menu Repository", () => {
  describe("create Method", () => {
    test("Should throw if no props are provided", async () => {
      const { sut } = makeSut();

      await expect(sut.create()).rejects.toThrow(new MissingParamError("id"));
    });

    test("Should throw if no id is provided", async () => {
      const { sut } = makeSut();
      const props = {
        businessId: "any_business_id",
        name: "any_name",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("id"),
      );
    });

    test("Should throw if no businessId is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_id",
        name: "any_name",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("businessId"),
      );
    });

    test("Should throw if no name is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_id",
        businessId: "any_business_id",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("name"),
      );
    });

    test("Should call postgresAdapter with correct object ", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      const props = {
        id: "any_id",
        businessId: "any_business_id",
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

    test("Should return menu if everything is right", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_id",
        businessId: "any_business_id",
        name: "any_name",
      };

      const menu = await sut.create(props);
      expect(menu).toEqual({
        id: "any_menu_id",
        business_id: "any_business_id",
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

    test("Should call postgresAdapter with correct object ", async () => {
      const { sut, postgresAdapterSpy } = makeSut();

      await sut.findAll("any_business_id");
      expect(postgresAdapterSpy.queryObject).toEqual({
        text: `
        SELECT 
          *
        FROM
          menus
        WHERE
          business_id = $1
        LIMIT
          10
      ;`,
        values: ["any_business_id"],
      });
    });

    test("Should return menu if everything is right", async () => {
      const { sut } = makeSut();

      const menus = await sut.findAll("any_business_id");
      expect(Array.isArray(menus)).toBe(true);
      expect(menus[0]).toEqual({
        id: "any_menu_id",
        business_id: "any_business_id",
        name: "any_name",
      });
    });
  });

  describe("findById Method", () => {
    test("Should throw if no businessId is provided", async () => {
      const { sut } = makeSut();

      await expect(sut.findById(undefined, "any_menu_id")).rejects.toThrow(
        new MissingParamError("businessId"),
      );
    });

    test("Should throw if no menuId is provided", async () => {
      const { sut } = makeSut();

      await expect(sut.findById("any_business_id")).rejects.toThrow(
        new MissingParamError("menuId"),
      );
    });

    test("Should call postgresAdapter with correct object ", async () => {
      const { sut, postgresAdapterSpy } = makeSut();

      await sut.findById("any_business_id", "any_menu_id");
      expect(postgresAdapterSpy.queryObject).toEqual({
        text: `
        SELECT
          *
        FROM
          menus
        WHERE
          id = $1 AND business_id = $2
        LIMIT
          1
        ;`,
        values: ["any_menu_id", "any_business_id"],
      });
    });

    test("Should return menu if everything is right", async () => {
      const { sut } = makeSut();

      const menu = await sut.findById("any_business_id", "any_menu_id");
      expect(menu).toEqual({
        id: "any_menu_id",
        business_id: "any_business_id",
        name: "any_name",
      });
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
      id: "any_menu_id",
      businessId: "any_business_id",
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
    const suts = [
      new MenuRepository({
        postgresAdapter: makePostgresAdapterWithError(),
      }),
    ];
    const props = {
      id: "any_menu_id",
      businessId: "any_business_id",
      name: "any_name",
    };

    for (const sut of suts) {
      await expect(sut.create(props)).rejects.toThrow();
      await expect(sut.findAll(props.businessId)).rejects.toThrow();
      await expect(sut.findById(props.businessId, props.id)).rejects.toThrow();
    }
  });
});
