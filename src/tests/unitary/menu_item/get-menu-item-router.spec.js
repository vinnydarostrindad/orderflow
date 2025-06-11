import MissingParamError from "../../../utils/errors/missing-param-error.js";
import ServerError from "../../../utils/errors/server-error.js";
import GetMenuItemRouter from "../../../presentation/routers/menu_item/get-menu-item-router.js";
import NotFoundError from "../../../utils/errors/not-found-error.js";

const makeSut = () => {
  const getMenuItemUseCaseSpy = makeGetMenuItemUseCase();
  const sut = new GetMenuItemRouter({
    getMenuItemUseCase: getMenuItemUseCaseSpy,
  });
  return {
    sut,
    getMenuItemUseCaseSpy,
  };
};

const makeGetMenuItemUseCase = () => {
  class GetMenuItemUseCaseSpy {
    async execute(menuId, menuItemId) {
      this.menuId = menuId;
      if (!menuItemId) {
        return this.menuItems;
      }

      this.menuItemId = menuItemId;
      return this.menuItem;
    }
  }

  const getMenuItemUseCaseSpy = new GetMenuItemUseCaseSpy();
  getMenuItemUseCaseSpy.menuItem = {
    id: "any_menu_item_id",
    menu_id: "any_menu_id",
    name: "any_name",
    price: "any_price",
    image_path: "any_img_path",
    description: "any_description",
    type: "any_type",
  };
  getMenuItemUseCaseSpy.menuItems = [
    {
      id: "any_menu_item_id",
      menu_id: "any_menu_id",
      name: "any_name",
      price: "any_price",
      image_path: "any_img_path",
      description: "any_description",
      type: "any_type",
    },
  ];
  return getMenuItemUseCaseSpy;
};

const makeGetMenuItemUseCaseWithError = () => {
  class GetMenuItemUseCaseSpy {
    execute() {
      throw new Error();
    }
  }

  return new GetMenuItemUseCaseSpy();
};

describe("Get Menu Item Router", () => {
  describe("Without menuItemId", () => {
    test("Should return 404 if no menuItems are found", async () => {
      const { sut, getMenuItemUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          menuId: "any_menu_id",
        },
      };
      getMenuItemUseCaseSpy.menuItems = null;

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(404);
      expect(httpResponse.body).toEqual(new NotFoundError("MenuItem"));
    });

    test("Should call getMenuItemUseCase with correct value", async () => {
      const { sut, getMenuItemUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          menuId: "any_menu_id",
        },
      };

      await sut.route(httpRequest);
      expect(getMenuItemUseCaseSpy.menuId).toBe("any_menu_id");
      expect(getMenuItemUseCaseSpy.menuItemId).toBeUndefined();
    });

    test("Should return 200 and a array of menu items", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: {
          menuId: "any_menu_id",
        },
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(200);
      expect(Array.isArray(httpResponse.body)).toBe(true);
      expect(httpResponse.body[0]).toEqual({
        id: "any_menu_item_id",
        menuId: "any_menu_id",
        name: "any_name",
        price: "any_price",
        imagePath: "any_img_path",
        description: "any_description",
        type: "any_type",
      });
    });
  });

  describe("With menuItemId", () => {
    test("Should return 404 if no menuItem is found", async () => {
      const { sut, getMenuItemUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          menuId: "any_menu_id",
          menuItemId: "any_menu_item_id",
        },
      };
      getMenuItemUseCaseSpy.menuItem = null;

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(404);
      expect(httpResponse.body).toEqual(new NotFoundError("MenuItem"));
    });

    test("Should call getMenuItemUseCase with correct value", async () => {
      const { sut, getMenuItemUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          menuId: "any_menu_id",
          menuItemId: "any_menu_item_id",
        },
      };

      await sut.route(httpRequest);
      expect(getMenuItemUseCaseSpy.menuId).toBe("any_menu_id");
      expect(getMenuItemUseCaseSpy.menuItemId).toBe("any_menu_item_id");
    });

    test("Should return 200 with menuItem correctly", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: {
          menuId: "any_menu_id",
          menuItemId: "any_menu_item_id",
        },
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(200);
      expect(httpResponse.body).toEqual({
        id: "any_menu_item_id",
        menuId: "any_menu_id",
        name: "any_name",
        price: "any_price",
        imagePath: "any_img_path",
        description: "any_description",
        type: "any_type",
      });
    });
  });

  test("Should return 400 if no menuId is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: {
        menuItemId: "any_menu_item_id",
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("menuId"));
  });

  test("Should return 500 if no httpRequest is provided", async () => {
    const { sut } = makeSut();

    const httpResponse = await sut.route();

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return 500 if no httpRequest has no params", async () => {
    const { sut } = makeSut();
    const httpRequest = {};
    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return 500 if invalid dependency is provided", async () => {
    const suts = [
      new GetMenuItemRouter(),
      new GetMenuItemRouter({}),
      new GetMenuItemRouter({
        getMenuItemUseCase: {},
      }),
    ];
    const httpRequest = {
      params: {
        menuId: "any_menu_id",
        menuItemId: "any_menu_item_id",
      },
    };

    for (const sut of suts) {
      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toEqual(new ServerError());
    }
  });

  test("Should return 500 if dependency throws", async () => {
    const suts = [
      new GetMenuItemRouter({
        getMenuItemUseCase: makeGetMenuItemUseCaseWithError(),
      }),
    ];
    const httpRequest = {
      params: {
        menuId: "any_menu_id",
        menuItemId: "any_menu_item_id",
      },
    };

    for (const sut of suts) {
      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toEqual(new ServerError());
    }
  });
});
