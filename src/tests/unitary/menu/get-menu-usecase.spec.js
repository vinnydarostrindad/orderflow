import MissingParamError from "../../../utils/errors/missing-param-error.js";
import GetMenuUseCase from "../../../domain/usecase/menu/get-menu-usecase.js";

const makeSut = () => {
  const menuRepositorySpy = makeMenuRepository();
  const sut = new GetMenuUseCase({
    menuRepository: menuRepositorySpy,
  });
  return {
    sut,
    menuRepositorySpy,
  };
};

const makeMenuRepository = () => {
  class MenuRepositorySpy {
    async findAll(businessId) {
      this.businessId = businessId;
      return this.menus;
    }

    async findById(businessId, menuId) {
      this.businessId = businessId;
      this.menuId = menuId;
      return this.menu;
    }
  }

  const menuRepositorySpy = new MenuRepositorySpy();
  menuRepositorySpy.menu = {
    businessId: "any_business_id",
    id: "any_menu_id",
    name: "any_name",
  };
  menuRepositorySpy.menus = [
    {
      businessId: "any_business_id",
      id: "any_menu_id",
      name: "any_name",
    },
  ];
  return menuRepositorySpy;
};

const makeMenuRepositoryWithError = () => {
  class MenuRepositorySpy {
    findById() {
      throw new Error();
    }
    findAll() {
      throw new Error();
    }
  }

  return new MenuRepositorySpy();
};

describe("Get Menu Usecase", () => {
  describe("Without menuId", () => {
    test("Should return null if menus is invalid", async () => {
      const { sut, menuRepositorySpy } = makeSut();
      menuRepositorySpy.menus = null;

      const menu = await sut.execute("any_business_id");
      expect(menu).toBeNull();
    });

    test("Should call menuRepository.findAll with correct value", async () => {
      const { sut, menuRepositorySpy } = makeSut();

      await sut.execute("any_business_id");
      expect(menuRepositorySpy.businessId).toBe("any_business_id");
    });

    test("Should return an array of menus", async () => {
      const { sut } = makeSut();

      const menus = await sut.execute("any_business_id");
      expect(Array.isArray(menus)).toBe(true);
      expect(menus[0]).toEqual({
        id: "any_menu_id",
        businessId: "any_business_id",
        name: "any_name",
      });
    });
  });
  describe("With menuId", () => {
    test("Should return null if menu is invalid", async () => {
      const { sut, menuRepositorySpy } = makeSut();
      menuRepositorySpy.menu = null;

      const menu = await sut.execute("any_business_id", "any_menu_id");
      expect(menu).toBeNull();
    });

    test("Should call menuRepository.findById with correct value", async () => {
      const { sut, menuRepositorySpy } = makeSut();

      await sut.execute("any_business_id", "any_menu_id");
      expect(menuRepositorySpy.businessId).toBe("any_business_id");
      expect(menuRepositorySpy.menuId).toBe("any_menu_id");
    });

    test("Should return menu correctly", async () => {
      const { sut } = makeSut();

      const menu = await sut.execute("any_business_id", "any_menu_id");
      expect(menu).toEqual({
        id: "any_menu_id",
        businessId: "any_business_id",
        name: "any_name",
      });
    });
  });

  test("Should throw if no businessId is provided", async () => {
    const { sut } = makeSut();

    await expect(sut.execute(undefined, "any_menu_id")).rejects.toThrow(
      new MissingParamError("businessId"),
    );
  });

  test("Should throw if invalid dependency is provided", async () => {
    const suts = [
      new GetMenuUseCase(),
      new GetMenuUseCase({}),
      new GetMenuUseCase({
        menuRepository: {},
      }),
    ];

    for (const sut of suts) {
      await expect(
        sut.execute("any_business_id", "any_menu_id"),
      ).rejects.toThrow(TypeError);
      await expect(sut.execute("any_business_id")).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if dependency throws", async () => {
    const suts = [
      new GetMenuUseCase({
        menuRepository: makeMenuRepositoryWithError(),
      }),
    ];

    for (const sut of suts) {
      await expect(
        sut.execute("any_business_id", "any_menu_id"),
      ).rejects.toThrow(new Error());
      await expect(sut.execute("any_business_id")).rejects.toThrow(new Error());
    }
  });
});
