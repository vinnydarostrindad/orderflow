import MenuItemRepository from "../../../infra/repositories/menu-item-repository.js";
import ValidationError from "../../../utils/errors/validation-error.js";
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
    async query(queryObject) {
      this.queryObject = queryObject;
      if (
        this.queryObject.values[1] == "any_name" ||
        this.queryObject.values[1] === "repeated_name"
      ) {
        return this.validateUniqueNameQueryResult;
      }
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
        image_path: "any_img_path",
        description: "any_description",
        type: "any_type",
      },
    ],
  };
  postgresAdapterSpy.validateUniqueNameQueryResult = {
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

describe("MenuItem Repository", () => {
  describe("create Method", () => {
    test("Should throw if no props are provided", async () => {
      const { sut } = makeSut();

      await expect(sut.create()).rejects.toThrow(new MissingParamError("id"));
    });

    test("Should throw if no id is provided", async () => {
      const { sut } = makeSut();
      const props = {
        menuId: "any_menu_id",
        name: "any_name",
        price: "any_price",
        imagePath: "any_img_path",
        description: "any_description",
        type: "any_type",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("id"),
      );
    });

    test("Should throw if no menuId is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_menu_item_id",
        name: "any_name",
        price: "any_price",
        imagePath: "any_img_path",
        description: "any_description",
        type: "any_type",
      };
      await expect(sut.create(props)).rejects.toThrow(
        new MissingParamError("menuId"),
      );
    });

    test("Should throw if no name is provided", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_menu_item_id",
        menuId: "any_menu_id",
        price: "any_price",
        imagePath: "any_img_path",
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
        menuId: "any_menu_id",
        name: "any_name",
        imagePath: "any_img_path",
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
        menuId: "any_menu_id",
        name: "any_name",
        price: "any_price",
        imagePath: "any_img_path",
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

    test("Should return menu item if everything is right", async () => {
      const { sut } = makeSut();
      const props = {
        id: "any_menu_item_id",
        menuId: "any_menu_id",
        name: "any_name",
        price: "any_price",
        imagePath: "any_img_path",
        description: "any_description",
        type: "any_type",
      };

      const menuItem = await sut.create(props);
      expect(menuItem).toEqual({
        id: "any_menu_item_id",
        menu_id: "any_menu_id",
        name: "any_name",
        price: "any_price",
        image_path: "any_img_path",
        description: "any_description",
        type: "any_type",
      });
    });
  });

  describe("findAll Method", () => {
    test("Should throw if no menuId is provided", async () => {
      const { sut } = makeSut();

      await expect(sut.findAll()).rejects.toThrow(
        new MissingParamError("menuId"),
      );
    });

    test("Should call postgresAdapter with correct object ", async () => {
      const { sut, postgresAdapterSpy } = makeSut();

      await sut.findAll("any_menu_id");
      expect(postgresAdapterSpy.queryObject).toEqual({
        text: `
        SELECT 
          *
        FROM
          menu_items
        WHERE
          menu_id = $1
        LIMIT
          10
      ;`,
        values: ["any_menu_id"],
      });
    });

    test("Should return menu items if everything is right", async () => {
      const { sut } = makeSut();

      const menuItems = await sut.findAll("any_menu_id");
      expect(Array.isArray(menuItems)).toBe(true);
      expect(menuItems[0]).toEqual({
        id: "any_menu_item_id",
        menu_id: "any_menu_id",
        name: "any_name",
        price: "any_price",
        image_path: "any_img_path",
        description: "any_description",
        type: "any_type",
      });
    });
  });

  describe("findById Method", () => {
    describe("With menuItemId", () => {
      test("Should call postgresAdapter with correct object", async () => {
        const { sut, postgresAdapterSpy } = makeSut();

        await sut.findById("any_menu_item_id");
        expect(postgresAdapterSpy.queryObject).toEqual({
          text: `
          SELECT
            *
          FROM
            menu_items
          WHERE
            id = $1
          LIMIT
            1
          ;`,
          values: ["any_menu_item_id"],
        });
      });
    });

    test("Should throw if no menuItemId is provided", async () => {
      const { sut } = makeSut();

      await expect(sut.findById()).rejects.toThrow(
        new MissingParamError("menuItemId"),
      );
    });

    test("Should call postgresAdapter with correct object ", async () => {
      const { sut, postgresAdapterSpy } = makeSut();

      await sut.findById("any_menu_item_id", "any_menu_id");
      expect(postgresAdapterSpy.queryObject).toEqual({
        text: `
        SELECT
          *
        FROM
          menu_items
        WHERE
          id = $1 AND menu_id = $2
        LIMIT
          1
        ;`,
        values: ["any_menu_item_id", "any_menu_id"],
      });
    });

    test("Should return menu item if everything is right", async () => {
      const { sut } = makeSut();

      const menuItem = await sut.findById("any_menu_item_id", "any_menu_id");
      expect(menuItem).toEqual({
        id: "any_menu_item_id",
        menu_id: "any_menu_id",
        name: "any_name",
        price: "any_price",
        image_path: "any_img_path",
        description: "any_description",
        type: "any_type",
      });
    });
  });

  describe("valideUniqueName method", () => {
    test("Should throw if no menuId is provided", async () => {
      const { sut } = makeSut();

      await expect(sut.validateUniqueName()).rejects.toThrow(
        new MissingParamError("menuId"),
      );
    });

    test("Should throw if no name is provided", async () => {
      const { sut } = makeSut();

      await expect(sut.validateUniqueName("any_menu_id")).rejects.toThrow(
        new MissingParamError("name"),
      );
    });

    test("Should throw rows if length is bigger than 0", async () => {
      const { sut, postgresAdapterSpy } = makeSut();
      postgresAdapterSpy.validateUniqueNameQueryResult.rows = [{}];

      await expect(
        sut.validateUniqueName("any_menu_id", "repeated_name"),
      ).rejects.toThrow(
        new ValidationError({
          message: "Name already exists in your menu.",
          action: "Make sure name does not exists.",
        }),
      );
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
      menuId: "any_menu_id",
      name: "any_name",
      price: "any_price",
      imagePath: "any_img_path",
      description: "any_description",
      type: "any_type",
    };

    for (const sut of suts) {
      await expect(sut.create(props)).rejects.toThrow(TypeError);
      await expect(sut.findAll(props.menuId)).rejects.toThrow(TypeError);
      await expect(sut.findById(props.menuId, props.id)).rejects.toThrow(
        TypeError,
      );
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
      menuId: "any_menu_id",
      name: "any_name",
      price: "any_price",
      imagePath: "any_img_path",
      description: "any_description",
      type: "any_type",
    };

    for (const sut of suts) {
      await expect(sut.create(props)).rejects.toThrow();
      await expect(sut.findAll(props.menuId)).rejects.toThrow();
      await expect(sut.findById(props.menuId, props.id)).rejects.toThrow();
    }
  });
});
