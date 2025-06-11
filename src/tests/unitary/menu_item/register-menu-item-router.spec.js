import MissingParamError from "../../../utils/errors/missing-param-error.js";
import ServerError from "../../../utils/errors/server-error.js";
import RegisterMenuItemRouter from "../../../presentation/routers/menu_item/register-menu-item-router.js";

const makeSut = () => {
  const registerMenuItemUseCaseSpy = makeRegisterMenuItemUseCase();
  const sut = new RegisterMenuItemRouter({
    registerMenuItemUseCase: registerMenuItemUseCaseSpy,
  });
  return { sut, registerMenuItemUseCaseSpy };
};

const makeRegisterMenuItemUseCase = () => {
  class RegisterMenuItemUseCaseSpy {
    async execute({ menuId, name, price, imagePath, description, type }) {
      this.menuId = menuId;
      this.name = name;
      this.price = price;
      this.imagePath = imagePath;
      this.description = description;
      this.type = type;
      return this.menuItem;
    }
  }

  const registerMenuItemUseCaseSpy = new RegisterMenuItemUseCaseSpy();
  registerMenuItemUseCaseSpy.menuItem = {
    id: "any_menu_item_id",
    menuId: "any_menu_id",
    name: "any_name",
    price: "any_price",
    imagePath: "any_img_path",
    description: "any_description",
    type: "any_type",
  };
  return registerMenuItemUseCaseSpy;
};

const makeRegisterMenuItemUseCaseWithError = () => {
  class RegisterMenuItemUseCaseSpy {
    async execute() {
      throw new Error();
    }
  }

  return new RegisterMenuItemUseCaseSpy();
};

describe("Register MenuItem Router", () => {
  test("Should return 400 if no menuId is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: {},
      body: {
        name: "any_name",
        price: "any_price",
        imagePath: "any_img_path",
        description: "any_description",
        type: "any_type",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("menuId"));
  });

  test("Should return 400 if no name is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { menuId: "any_menu_id" },
      body: {
        price: "any_price",
        imagePath: "any_img_path",
        description: "any_description",
        type: "any_type",
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("name"));
  });

  test("Should return 400 if no price is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { menuId: "any_menu_id" },
      body: {
        name: "any_name",
        imagePath: "any_img_path",
        description: "any_description",
        type: "any_type",
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("price"));
  });

  test("Should return 500 if no httpRequest is provided", async () => {
    const { sut } = makeSut();
    const httpResponse = await sut.route();
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return 500 if httpRequest has no body", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { menuId: "any_menu_id" },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return 500 if httpRequest has no params", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        price: "any_price",
        imagePath: "any_img_path",
        description: "any_description",
        type: "any_type",
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return Error if no menuItem is returned", async () => {
    const { sut, registerMenuItemUseCaseSpy } = makeSut();
    const httpRequest = {
      params: { menuId: "any_menu_id" },
      body: {
        name: "any_name",
        price: "any_price",
        imagePath: "any_img_path",
        description: "any_description",
        type: "any_type",
      },
    };
    registerMenuItemUseCaseSpy.menuItem = null;

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should call registerMenuItemUseCase with correct params", async () => {
    const { sut, registerMenuItemUseCaseSpy } = makeSut();
    const httpRequest = {
      params: { menuId: "any_menu_id" },
      body: {
        name: "any_name",
        price: "any_price",
        imagePath: "any_img_path",
        description: "any_description",
        type: "any_type",
      },
    };
    await sut.route(httpRequest);
    expect(registerMenuItemUseCaseSpy.menuId).toBe("any_menu_id");
    expect(registerMenuItemUseCaseSpy.name).toBe("any_name");
    expect(registerMenuItemUseCaseSpy.price).toBe("any_price");
    expect(registerMenuItemUseCaseSpy.imagePath).toBe("any_img_path");
    expect(registerMenuItemUseCaseSpy.description).toBe("any_description");
    expect(registerMenuItemUseCaseSpy.type).toBe("any_type");
  });

  test("Should return 201 with created menuItem if inputs are valid", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { menuId: "any_menu_id" },
      body: {
        name: "any_name",
        price: "any_price",
        imagePath: "any_img_path",
        description: "any_description",
        type: "any_type",
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(201);
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

  test("Should return 500 if invalid dependency is provided", async () => {
    const suts = [
      new RegisterMenuItemRouter(),
      new RegisterMenuItemRouter({}),
      new RegisterMenuItemRouter({
        registerMenuItemUseCase: {},
      }),
    ];
    const httpRequest = {
      params: { menuId: "any_menu_id" },
      body: {
        name: "any_name",
        price: "any_price",
        imagePath: "any_img_path",
        description: "any_description",
        type: "any_type",
      },
    };

    for (const sut of suts) {
      const httpResponse = await sut.route(httpRequest);

      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toEqual(new ServerError());
    }
  });

  test("Should return 500 if any dependency throws", async () => {
    const suts = [
      new RegisterMenuItemRouter({
        registerMenuItemUseCase: makeRegisterMenuItemUseCaseWithError(),
      }),
    ];
    const httpRequest = {
      params: { menuId: "any_menu_id" },
      body: {
        name: "any_name",
        price: "any_price",
        imagePath: "any_img_path",
        description: "any_description",
        type: "any_type",
      },
    };

    for (const sut of suts) {
      const httpResponse = await sut.route(httpRequest);

      expect(httpResponse.statusCode).toBe(500);
      expect(httpResponse.body).toEqual(new ServerError());
    }
  });
});
