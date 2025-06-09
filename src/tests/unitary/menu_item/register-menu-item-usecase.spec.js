import RegisterMenuItemUseCase from "../../../domain/usecase/menu_item/register-menu-item-usecase.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import DependencyError from "../../../utils/errors/dependency-error.js";
import RepositoryError from "../../../utils/errors/repository-error.js";

const makeSut = () => {
  const idGeneratorSpy = makeIdGenerator();
  const menuItemRepositorySpy = makeMenuItemRepository();
  const sut = new RegisterMenuItemUseCase({
    idGenerator: idGeneratorSpy,
    menuItemRepository: menuItemRepositorySpy,
  });
  return {
    sut,
    idGeneratorSpy,
    menuItemRepositorySpy,
  };
};

const makeIdGenerator = () => {
  const idGeneratorSpy = {
    execute() {
      return this.id;
    },
  };

  idGeneratorSpy.id = "any_menu_item_id";
  return idGeneratorSpy;
};

const makeIdGeneratorWithError = () => {
  return {
    execute() {
      throw new Error();
    },
  };
};

const makeMenuItemRepository = () => {
  class MenuItemRepositorySpy {
    async create({ id, menu_id, name, price, image_path, description, type }) {
      this.id = id;
      this.menu_id = menu_id;
      this.name = name;
      this.price = price;
      this.image_path = image_path;
      this.description = description;
      this.type = type;
      return this.menuItem;
    }
  }

  const menuItemRepositorySpy = new MenuItemRepositorySpy();
  menuItemRepositorySpy.menuItem = {
    id: "any_menu_item_id",
    menu_id: "any_menu_id",
    name: "any_name",
    price: "any_price",
    image_path: "any_img_path",
    description: "any_description",
    type: "any_type",
  };
  return menuItemRepositorySpy;
};

const makeMenuItemRepositoryWithError = () => {
  class MenuItemRepositorySpy {
    create() {
      throw new Error();
    }
  }

  return new MenuItemRepositorySpy();
};

describe("Register Menu Item UseCase", () => {
  test("Should throw if no props are provided ", async () => {
    const { sut } = makeSut();
    await expect(sut.execute()).rejects.toThrow(new MissingParamError("name"));
  });

  test("Should throw if no name is provided ", async () => {
    const { sut } = makeSut();
    const props = {
      menu_id: "any_menu_id",
      price: "any_price",
      image_path: "any_img_path",
      description: "any_description",
      type: "any_type",
    };

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("name"),
    );
  });

  test("Should throw if no price is provided ", async () => {
    const { sut } = makeSut();
    const props = {
      menu_id: "any_menu_id",
      name: "any_name",
      image_path: "any_img_path",
      description: "any_description",
      type: "any_type",
    };

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("price"),
    );
  });

  test("Should throw if no menu_id is provided ", async () => {
    const { sut } = makeSut();
    const props = {
      name: "any_name",
      price: "any_price",
      image_path: "any_img_path",
      description: "any_description",
      type: "any_type",
    };
    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("menu_id"),
    );
  });

  test("Should throw if idGenerator returns invalid id", async () => {
    const { sut, idGeneratorSpy } = makeSut();
    const props = {
      menu_id: "any_menu_id",
      name: "any_name",
      price: "any_price",
      image_path: "any_img_path",
      description: "any_description",
      type: "any_type",
    };
    idGeneratorSpy.id = null;

    await expect(sut.execute(props)).rejects.toThrow(
      new DependencyError("idGenerator"),
    );
  });

  test("Should call menuItemRepository with correct values", async () => {
    const { sut, menuItemRepositorySpy, idGeneratorSpy } = makeSut();
    const props = {
      menu_id: "any_menu_id",
      name: "any_name",
      price: "any_price",
      image_path: "any_img_path",
      description: "any_description",
      type: "any_type",
    };

    await sut.execute(props);
    expect(menuItemRepositorySpy.id).toBe(idGeneratorSpy.id);
    expect(menuItemRepositorySpy.menu_id).toBe("any_menu_id");
    expect(menuItemRepositorySpy.name).toBe("any_name");
    expect(menuItemRepositorySpy.price).toBe("any_price");
    expect(menuItemRepositorySpy.image_path).toBe("any_img_path");
    expect(menuItemRepositorySpy.description).toBe("any_description");
    expect(menuItemRepositorySpy.type).toBe("any_type");
  });

  test("Should throw if menuItemRepository returns invalid menuItem", async () => {
    const { sut, menuItemRepositorySpy } = makeSut();
    const props = {
      menu_id: "any_menu_id",
      name: "any_name",
      price: "any_price",
      image_path: "any_img_path",
      description: "any_description",
      type: "any_type",
    };
    menuItemRepositorySpy.menuItem = null;

    await expect(sut.execute(props)).rejects.toThrow(
      new RepositoryError("menuItem"),
    );
  });

  test("Should return menu item if everything is right", async () => {
    const { sut } = makeSut();
    const props = {
      menu_id: "any_menu_id",
      name: "any_name",
      price: "any_price",
      image_path: "any_img_path",
      description: "any_description",
      type: "any_type",
    };

    const menuItem = await sut.execute(props);
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

  test("Should throw if invalid dependencieses are provided", async () => {
    const idGenerator = makeIdGenerator();
    const suts = [
      new RegisterMenuItemUseCase(),
      new RegisterMenuItemUseCase({}),
      new RegisterMenuItemUseCase({
        idGenerator: {},
      }),
      new RegisterMenuItemUseCase({
        idGenerator,
      }),
      new RegisterMenuItemUseCase({
        idGenerator,
        menuItemRepository: {},
      }),
    ];
    const props = {
      menu_id: "any_menu_id",
      name: "any_name",
      price: "any_price",
      image_path: "any_img_path",
      description: "any_description",
      type: "any_type",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if any dependency throws", async () => {
    const idGenerator = makeIdGenerator();
    const suts = [
      new RegisterMenuItemUseCase({
        idGenerator: makeIdGeneratorWithError(),
      }),
      new RegisterMenuItemUseCase({
        idGenerator,
        menuItemRepository: makeMenuItemRepositoryWithError(),
      }),
    ];
    const props = {
      menu_id: "any_menu_id",
      name: "any_name",
      price: "any_price",
      image_path: "any_img_path",
      description: "any_description",
      type: "any_type",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow();
    }
  });
});
