import MenuItemRepository from "../../../infra/repositories/menu-item-repository.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const postgresAdapterSpy = makePostgresAdapter();
  const sut = new MenuItemRepository({
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
        id: "any_menu_item_id",
        menu_id: "any_menu_id",
        name: "any_name",
        price: "any_price",
        image_path: "any_img",
        description: "any_description",
        type: "any_type",
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

describe("MenuItem Repository", () => {
  describe("create Method", () => {
    test("Should throw if no props are provided", async () => {
      const { sut } = makeSut();
      // Fazer um erro mais específico depois
      await expect(sut.create()).rejects.toThrow(new MissingParamError("id"));
    });

    test("Should throw if no id is provided", async () => {
      const { sut } = makeSut();
      const props = {
        menu_id: "any_menu_id",
        name: "any_name",
        price: "any_price",
        image_path: "any_img_path",
        description: "any_description",
        type: "any_type",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("id"),
      );
    });

    test("Should throw if no menu_id is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_menu_item_id",
        name: "any_name",
        price: "any_price",
        image_path: "any_img_path",
        description: "any_description",
        type: "any_type",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("menu_id"),
      );
    });

    test("Should throw if no name is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_menu_item_id",
        menu_id: "any_menu_id",
        price: "any_price",
        image_path: "any_img_path",
        description: "any_description",
        type: "any_type",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("name"),
      );
    });

    test("Should throw if no price is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_menu_item_id",
        menu_id: "any_menu_id",
        name: "any_name",
        image_path: "any_img_path",
        description: "any_description",
        type: "any_type",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("price"),
      );
    });

    test("Should call postgresAdapter with correct object ", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      const props = {
        id: "any_menu_item_id",
        menu_id: "any_menu_id",
        name: "any_name",
        price: "any_price",
        image_path: "any_img_path",
        description: "any_description",
        type: "any_type",
      };
      await sut.create(props);
      expect(postgresAdapterSpy.queryObject).toEqual({
        text: `
        INSERT INTO
          menu_items (id, menu_id, name, price, image_path, description, type)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
          *
      ;`,
        values: [
          "any_menu_item_id",
          "any_menu_id",
          "any_name",
          "any_price",
          "any_img_path",
          "any_description",
          "any_type",
        ],
      });
    });

    test("Should return null if postgresAdapter return invalid menu item", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      const props = {
        id: "any_menu_item_id",
        menu_id: "any_menu_id",
        name: "any_name",
        price: "any_price",
        image_path: "any_img",
        description: "any_description",
        type: "any_type",
      };
      postgresAdapterSpy.queryResult = null;

      const menuItem = await sut.create(props);
      expect(menuItem).toBeNull();
    });

    test("Should return menu item if everything is right", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_menu_item_id",
        menu_id: "any_menu_id",
        name: "any_name",
        price: "any_price",
        image_path: "any_img",
        description: "any_description",
        type: "any_type",
      };

      const menuItem = await sut.create(props);
      expect(menuItem).toEqual({
        id: "any_menu_item_id",
        menu_id: "any_menu_id",
        name: "any_name",
        price: "any_price",
        image_path: "any_img",
        description: "any_description",
        type: "any_type",
      });
    });
  });

  test("Should throw if invalid dependencies are provided", async () => {
    const suts = [
      new MenuItemRepository(),
      new MenuItemRepository({}),
      new MenuItemRepository({
        postgresAdapter: {},
      }),
    ];
    const props = {
      id: "any_menu_item_id",
      menu_id: "any_menu_id",
      name: "any_name",
      price: "any_price",
      image_path: "any_img",
      description: "any_description",
      type: "any_type",
    };

    for (const sut of suts) {
      await expect(sut.create(props)).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if any dependency throws", async () => {
    const suts = [
      new MenuItemRepository({
        postgresAdapter: makePostgresAdapterWithError(),
      }),
    ];
    const props = {
      id: "any_menu_item_id",
      menu_id: "any_menu_id",
      name: "any_name",
      price: "any_price",
      image_path: "any_img",
      description: "any_description",
      type: "any_type",
    };

    for (const sut of suts) {
      await expect(sut.create(props)).rejects.toThrow();
    }
  });
});
