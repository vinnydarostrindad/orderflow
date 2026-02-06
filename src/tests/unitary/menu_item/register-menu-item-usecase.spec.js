import MissingParamError from "../../../utils/errors/missing-param-error.js";
import RegisterMenuItemUseCase from "../../../domain/usecase/menu_item/register-menu-item-usecase.js";

const makeSut = () => {
  const idGeneratorSpy = makeIdGenerator();
  const menuItemRepositorySpy = makeMenuItemRepository();
  const supabaseAdapterSpy = makeSupabaseAdaptor();
  const sut = new RegisterMenuItemUseCase({
    idGenerator: idGeneratorSpy,
    menuItemRepository: menuItemRepositorySpy,
    supabaseAdapter: supabaseAdapterSpy,
  });
  return {
    sut,
    idGeneratorSpy,
    menuItemRepositorySpy,
    supabaseAdapterSpy,
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
    async create({ id, menuId, name, price, imagePath, description, type }) {
      this.id = id;
      this.menuId = menuId;
      this.name = name;
      this.price = price;
      this.imagePath = imagePath;
      this.description = description;
      this.type = type;
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

const makeSupabaseAdaptor = () => {
  const supabaseAdapterSpy = {
    async uploadFile(bucket, fileName, imgFile) {
      this.bucket = bucket;
      this.fileName = fileName;
      this.imgFile = imgFile;
    },
  };

  return supabaseAdapterSpy;
};

const makeSupabaseAdaptorWithError = () => {
  const supabaseAdapter = {
    uploadFile: function () {
      throw new Error();
    },
  };

  return supabaseAdapter;
};

describe("Register Menu Item UseCase", () => {
  test("Should throw if no props are provided ", async () => {
    const { sut } = makeSut();
    await expect(sut.execute()).rejects.toThrow(new MissingParamError("name"));
  });

  test("Should throw if no name is provided ", async () => {
    const { sut } = makeSut();
    const props = {
      menuId: "any_menu_id",
      price: "any_price",
      imgFile: "any_img_file",
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
      menuId: "any_menu_id",
      name: "any_name",
      imgFile: "any_img_file",
      description: "any_description",
      type: "any_type",
    };

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("price"),
    );
  });

  test("Should throw if no menuId is provided ", async () => {
    const { sut } = makeSut();
    const props = {
      name: "any_name",
      price: "any_price",
      imgFile: "any_img_file",
      description: "any_description",
      type: "any_type",
    };
    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("menuId"),
    );
  });

  test("Should call supabaseAdaptor.uploadFile with correct values", async () => {
    const { sut, supabaseAdapterSpy } = makeSut();
    const props = {
      menuId: "any_menu_id",
      name: "any_name",
      price: "any_price",
      description: "any_description",
      imgFile: {
        fileName: "any_file_name",
        content: "any_content",
      },
      type: "any_type",
    };

    await sut.execute(props);
    expect(supabaseAdapterSpy.bucket).toBe("orderflow");
    expect(supabaseAdapterSpy.fileName).toMatch(/[\d]*_any_file_name/);
    expect(supabaseAdapterSpy.imgFile).toEqual({
      content: "any_content",
      fileName: "any_file_name",
    });
  });

  test("Should call menuItemRepository with correct values", async () => {
    const { sut, menuItemRepositorySpy, idGeneratorSpy } = makeSut();
    const props = {
      menuId: "any_menu_id",
      name: "any_name",
      price: "any_price",
      description: "any_description",
      type: "any_type",
    };

    await sut.execute(props);
    expect(menuItemRepositorySpy.id).toBe(idGeneratorSpy.id);
    expect(menuItemRepositorySpy.menuId).toBe("any_menu_id");
    expect(menuItemRepositorySpy.name).toBe("any_name");
    expect(menuItemRepositorySpy.price).toBe("any_price");
    expect(menuItemRepositorySpy.imagePath).toBe(undefined);
    expect(menuItemRepositorySpy.description).toBe("any_description");
    expect(menuItemRepositorySpy.type).toBe("any_type");
  });

  test("Should return menu item if everything is right", async () => {
    const { sut } = makeSut();
    const props = {
      menuId: "any_menu_id",
      name: "any_name",
      price: "any_price",
      description: "any_description",
      type: "any_type",
    };

    const menuItem = await sut.execute(props);
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

  test("Should throw if invalid dependencieses are provided", async () => {
    const idGenerator = makeIdGenerator();
    const menuItemRepository = makeMenuItemRepository();
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
      new RegisterMenuItemUseCase({
        idGenerator,
        menuItemRepository,
        supabaseAdapter: {},
      }),
    ];
    const props = {
      menuId: "any_menu_id",
      name: "any_name",
      price: "any_price",
      imgFile: {
        fileName: "any_file_name",
        content: "any_content",
      },
      description: "any_description",
      type: "any_type",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if any dependency throws", async () => {
    const idGenerator = makeIdGenerator();
    const menuItemRepository = makeMenuItemRepository();
    const suts = [
      new RegisterMenuItemUseCase({
        idGenerator: makeIdGeneratorWithError(),
      }),
      new RegisterMenuItemUseCase({
        idGenerator,
        menuItemRepository: makeMenuItemRepositoryWithError(),
      }),
      new RegisterMenuItemUseCase({
        idGenerator,
        menuItemRepository,
        supabaseAdapter: makeSupabaseAdaptorWithError(),
      }),
    ];
    const props = {
      menuId: "any_menu_id",
      name: "any_name",
      price: "any_price",
      imgFile: {
        fileName: "any_file_name",
        content: "any_content",
      },
      description: "any_description",
      type: "any_type",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow();
    }
  });
});
