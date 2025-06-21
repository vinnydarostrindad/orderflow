import MissingParamError from "../../../utils/errors/missing-param-error.js";
import RegisterMenuItemRouter from "../../../presentation/routers/menu_item/register-menu-item-router.js";

const makeSut = () => {
  const registerMenuItemUseCaseSpy = makeRegisterMenuItemUseCase();
  const validatorsSpy = makeValidators();
  const sut = new RegisterMenuItemRouter({
    registerMenuItemUseCase: registerMenuItemUseCaseSpy,
    validators: validatorsSpy,
  });
  return { sut, registerMenuItemUseCaseSpy, validatorsSpy };
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

const makeValidators = () => {
  const validatorsSpy = {
    uuid(uuidValue) {
      this.uuidValue = uuidValue;
      return true;
    },
  };

  return validatorsSpy;
};

const makeValidatorsWithError = () => {
  const validatorsSpy = {
    uuid() {
      throw new Error();
    },
  };

  return validatorsSpy;
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

  test("Should throw if no httpRequest is provided", async () => {
    const { sut } = makeSut();
    await expect(sut.route()).rejects.toThrow();
  });

  test("Should throw if httpRequest has no body", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: { menuId: "any_menu_id" },
    };

    await expect(sut.route(httpRequest)).rejects.toThrow();
  });

  test("Should throw if httpRequest has no params", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        price: "any_price",
        imagePath: "any_img_path",
        description: "any_description",
        type: "any_type",
      },
    };

    await expect(sut.route(httpRequest)).rejects.toThrow();
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

  test("Should throw if invalid dependency is provided", async () => {
    const suts = [
      new RegisterMenuItemRouter(),
      new RegisterMenuItemRouter({}),
      new RegisterMenuItemRouter({
        registerMenuItemUseCase: {},
      }),
      new RegisterMenuItemRouter({
        registerMenuItemUseCase: makeRegisterMenuItemUseCase,
        validators: {},
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
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });

  test("Should throw if any dependency throws", async () => {
    const suts = [
      new RegisterMenuItemRouter({
        registerMenuItemUseCase: makeRegisterMenuItemUseCaseWithError(),
      }),
      new RegisterMenuItemRouter({
        registerMenuItemUseCase: makeRegisterMenuItemUseCase(),
        validators: makeValidatorsWithError(),
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
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });
});
