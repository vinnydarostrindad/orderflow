import GetMenuItemUseCase from "../../../domain/usecase/menu_item/get-menu-item-usecase.js";

const makeSut = () => {
  const menuItemRepositorySpy = makeMenuItemRepository();
  const sut = new GetMenuItemUseCase({
    menuItemRepository: menuItemRepositorySpy,
  });
  return {
    sut,
    menuItemRepositorySpy,
  };
};

const makeMenuItemRepository = () => {
  class MenuItemRepositorySpy {
    async findAll(menuId) {
      this.menuId = menuId;
      return this.menuItems;
    }

    async findById(menuItemId, menuId) {
      this.menuId = menuId;
      this.menuItemId = menuItemId;
      return this.menuItem;
    }
  }

  const menuItemRepositorySpy = new MenuItemRepositorySpy();
  menuItemRepositorySpy.menuItem = {
    id: "any_menu_item_id",
    menuId: "any_menu_id",
    name: "any_name",
    price: "any_price",
    imagePath: "any_img_path",
    description: "any_description",
    type: "any_type",
  };
  menuItemRepositorySpy.menuItems = [
    {
      id: "any_menu_item_id",
      menuId: "any_menu_id",
      name: "any_name",
      price: "any_price",
      imagePath: "any_img_path",
      description: "any_description",
      type: "any_type",
    },
  ];
  return menuItemRepositorySpy;
};

const makeMenuItemRepositoryWithError = () => {
  class menuItemRepositorySpy {
    findById() {
      throw new Error();
    }
    findAll() {
      throw new Error();
    }
  }

  return new menuItemRepositorySpy();
};

describe("Get Menu Item Usecase", () => {
  describe("Without menuItemId", () => {
    test("Should return null if menuItems is invalid", async () => {
      const { sut, menuItemRepositorySpy } = makeSut();
      menuItemRepositorySpy.menuItems = null;

      const menuItem = await sut.execute({ menuId: "menu_id" });
      expect(menuItem).toBeNull();
    });

    test("Should call menuItemRepository.findAll with correct value", async () => {
      const { sut, menuItemRepositorySpy } = makeSut();

      await sut.execute({ menuId: "menu_id" });
      expect(menuItemRepositorySpy.menuId).toBe("menu_id");
      expect(menuItemRepositorySpy.menuItemId).toBeUndefined();
    });

    test("Should return an array of menuItems", async () => {
      const { sut } = makeSut();

      const menuItems = await sut.execute({ menuId: "menu_id" });
      expect(Array.isArray(menuItems)).toBe(true);
      expect(menuItems[0]).toEqual({
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
    test("Should return null if menuItem is invalid", async () => {
      const { sut, menuItemRepositorySpy } = makeSut();
      menuItemRepositorySpy.menuItem = null;

      const menuItem = await sut.execute({
        menuId: "menu_id",
        menuItemId: "any_menu_item_id",
      });
      expect(menuItem).toBeNull();
    });

    test("Should call menuItemRepository.findById with correct value", async () => {
      const { sut, menuItemRepositorySpy } = makeSut();

      await sut.execute({ menuId: "menu_id", menuItemId: "any_menu_item_id" });
      expect(menuItemRepositorySpy.menuId).toBe("menu_id");
      expect(menuItemRepositorySpy.menuItemId).toBe("any_menu_item_id");
    });

    test("Should return menuItem correctly", async () => {
      const { sut } = makeSut();

      const menuItem = await sut.execute({
        menuId: "menu_id",
        menuItemId: "any_menu_item_id",
      });
      expect(menuItem).toEqual({
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

  test("Should throw if invalid dependency is provided", async () => {
    const suts = [
      new GetMenuItemUseCase(),
      new GetMenuItemUseCase({}),
      new GetMenuItemUseCase({
        menuItemRepository: {},
      }),
    ];

    for (const sut of suts) {
      await expect(
        sut.execute({ menuId: "menu_id", menuItemId: "any_menu_item_id" }),
      ).rejects.toThrow(TypeError);
      await expect(sut.execute({ menuId: "menu_id" })).rejects.toThrow(
        TypeError,
      );
    }
  });

  test("Should throw if dependency throws", async () => {
    const suts = [
      new GetMenuItemUseCase({
        menuItemRepository: makeMenuItemRepositoryWithError(),
      }),
    ];

    for (const sut of suts) {
      await expect(
        sut.execute({ menuId: "menu_id", menuItemId: "any_menu_item_id" }),
      ).rejects.toThrow(new Error());
      await expect(sut.execute({ menuId: "menu_id" })).rejects.toThrow(
        new Error(),
      );
    }
  });
});
