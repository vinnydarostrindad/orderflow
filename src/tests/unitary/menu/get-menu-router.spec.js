import MissingParamError from "../../../utils/errors/missing-param-error.js";
import GetMenuRouter from "../../../presentation/routers/menu/get-menu-router.js";
import NotFoundError from "../../../utils/errors/not-found-error.js";

const makeSut = () => {
  const getMenuUseCaseSpy = makeGetMenuUseCase();
  const validatorsSpy = makeValidators();
  const sut = new GetMenuRouter({
    getMenuUseCase: getMenuUseCaseSpy,
    validators: validatorsSpy,
  });
  return { sut, getMenuUseCaseSpy, validatorsSpy };
};

const makeGetMenuUseCase = () => {
  class GetMenuUseCaseSpy {
    async execute(businessId, menuId) {
      this.businessId = businessId;
      if (!menuId) {
        return this.menus;
      }

      this.menuId = menuId;
      return this.menu;
    }
  }

  const getMenuUseCaseSpy = new GetMenuUseCaseSpy();
  getMenuUseCaseSpy.menu = {
    businessId: "any_business_id",
    id: "any_menu_id",
    name: "any_name",
  };
  getMenuUseCaseSpy.menus = [
    {
      businessId: "any_business_id",
      id: "any_menu_id",
      name: "any_name",
    },
  ];
  return getMenuUseCaseSpy;
};

const makeGetMenuUseCaseWithError = () => {
  class GetMenuUseCaseSpy {
    execute() {
      throw new Error();
    }
  }

  return new GetMenuUseCaseSpy();
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

describe("Get Menu Router", () => {
  describe("Without menuId", () => {
    test("Should call getMenuUseCase with correct value", async () => {
      const { sut, getMenuUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          businessId: "any_business_id",
        },
      };

      await sut.route(httpRequest);
      expect(getMenuUseCaseSpy.businessId).toBe("any_business_id");
      expect(getMenuUseCaseSpy.menuId).toBeUndefined();
    });

    test("Should return 200 and a array of menus", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: {
          businessId: "any_business_id",
        },
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(200);
      expect(Array.isArray(httpResponse.body)).toBe(true);
      expect(httpResponse.body[0]).toEqual({
        id: "any_menu_id",
        businessId: "any_business_id",
        name: "any_name",
      });
    });
  });

  describe("With menuId", () => {
    test("Should return 404 if no menu is found", async () => {
      const { sut, getMenuUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          businessId: "any_business_id",
          menuId: "any_menu_id",
        },
      };
      getMenuUseCaseSpy.menu = null;

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(404);
      expect(httpResponse.body).toEqual(
        new NotFoundError({ resource: "Menu" }),
      );
    });

    test("Should call getMenuUseCase with correct value", async () => {
      const { sut, getMenuUseCaseSpy } = makeSut();
      const httpRequest = {
        params: {
          businessId: "any_business_id",
          menuId: "any_menu_id",
        },
      };

      await sut.route(httpRequest);
      expect(getMenuUseCaseSpy.businessId).toBe("any_business_id");
      expect(getMenuUseCaseSpy.menuId).toBe("any_menu_id");
    });

    test("Should return 200 with menu correctly", async () => {
      const { sut } = makeSut();
      const httpRequest = {
        params: {
          businessId: "any_business_id",
          menuId: "any_menu_id",
        },
      };

      const httpResponse = await sut.route(httpRequest);
      expect(httpResponse.statusCode).toBe(200);
      expect(httpResponse.body).toEqual({
        id: "any_menu_id",
        businessId: "any_business_id",
        name: "any_name",
      });
    });
  });

  test("Should return 400 if no businessId is provided", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      params: {
        menuId: "any_menu_id",
      },
    };

    const httpResponse = await sut.route(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("businessId"));
  });

  test("Should throw if no httpRequest is provided", async () => {
    const { sut } = makeSut();

    await expect(sut.route()).rejects.toThrow();
  });

  test("Should throw if no httpRequest has no params", async () => {
    const { sut } = makeSut();
    const httpRequest = {};

    await expect(sut.route(httpRequest)).rejects.toThrow();
  });

  test("Should throw if invalid dependency is provided", async () => {
    const suts = [
      new GetMenuRouter(),
      new GetMenuRouter({}),
      new GetMenuRouter({
        getMenuUseCase: {},
      }),
      new GetMenuRouter({
        getMenuUseCase: makeGetMenuUseCase(),
        validators: {},
      }),
    ];
    const httpRequest = {
      params: {
        businessId: "any_business_id",
        menuId: "any_menu_id",
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });

  test("Should throw if dependency throws", async () => {
    const suts = [
      new GetMenuRouter({
        getMenuUseCase: makeGetMenuUseCaseWithError(),
      }),
      new GetMenuRouter({
        getMenuUseCase: makeGetMenuUseCase(),
        validators: makeValidatorsWithError(),
      }),
    ];
    const httpRequest = {
      params: {
        businessId: "any_business_id",
        menuId: "any_menu_id",
      },
    };

    for (const sut of suts) {
      await expect(sut.route(httpRequest)).rejects.toThrow();
    }
  });
});
