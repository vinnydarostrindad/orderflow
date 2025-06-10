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
    async execute({ menu_id, name, price, image_path, description, type }) {
      this.menu_id = menu_id;
      this.name = name;
      this.price = price;
      this.image_path = image_path;
      this.description = description;
      this.type = type;
      return this.menu_item;
    }
  }

  const registerMenuItemUseCaseSpy = new RegisterMenuItemUseCaseSpy();
  registerMenuItemUseCaseSpy.menu_item = {
    id: "any_menu_item_id",
    menu_id: "any_menu_id",
    name: "any_name",
    price: "any_price",
    image_path: "any_img_path",
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
  test("Should return 400 if no menu_id is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: {},
      body: {
        name: "any_name",
        price: "any_price",
        image_path: "any_img_path",
        description: "any_description",
        type: "any_type",
      },
    };

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("menu_id"));
  });

  test("Should return 400 if no name is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { menu_id: "any_menu_id" },
      body: {
        price: "any_price",
        image_path: "any_img_path",
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
      params: { menu_id: "any_menu_id" },
      body: {
        name: "any_name",
        image_path: "any_img_path",
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
      params: { menu_id: "any_menu_id" },
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
        image_path: "any_img_path",
        description: "any_description",
        type: "any_type",
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should return Error if no menu_item is returned", async () => {
    const { sut, registerMenuItemUseCaseSpy } = makeSut();
    const httpRequest = {
      params: { menu_id: "any_menu_id" },
      body: {
        name: "any_name",
        price: "any_price",
        image_path: "any_img_path",
        description: "any_description",
        type: "any_type",
      },
    };
    registerMenuItemUseCaseSpy.menu_item = null;

    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Should call registerMenuItemUseCase with correct params", async () => {
    const { sut, registerMenuItemUseCaseSpy } = makeSut();
    const httpRequest = {
      params: { menu_id: "any_menu_id" },
      body: {
        name: "any_name",
        price: "any_price",
        image_path: "any_img_path",
        description: "any_description",
        type: "any_type",
      },
    };
    await sut.route(httpRequest);
    expect(registerMenuItemUseCaseSpy.menu_id).toBe("any_menu_id");
    expect(registerMenuItemUseCaseSpy.name).toBe("any_name");
    expect(registerMenuItemUseCaseSpy.price).toBe("any_price");
    expect(registerMenuItemUseCaseSpy.image_path).toBe("any_img_path");
    expect(registerMenuItemUseCaseSpy.description).toBe("any_description");
    expect(registerMenuItemUseCaseSpy.type).toBe("any_type");
  });

  test("Should return 201 with created menu_item if inputs are valid", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { menu_id: "any_menu_id" },
      body: {
        name: "any_name",
        price: "any_price",
        image_path: "any_img_path",
        description: "any_description",
        type: "any_type",
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(201);
    expect(httpResponse.body).toEqual({
      id: "any_menu_item_id",
      menu_id: "any_menu_id",
      name: "any_name",
      price: "any_price",
      image_path: "any_img_path",
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
      params: { menu_id: "any_menu_id" },
      body: {
        name: "any_name",
        price: "any_price",
        image_path: "any_img_path",
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
      params: { menu_id: "any_menu_id" },
      body: {
        name: "any_name",
        price: "any_price",
        image_path: "any_img_path",
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
