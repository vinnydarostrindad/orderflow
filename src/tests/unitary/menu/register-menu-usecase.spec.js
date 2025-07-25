import RegisterMenuUseCase from "../../../domain/usecase/menu/register-menu-usecase.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

const makeSut = () => {
  const idGeneratorSpy = makeIdGenerator();
  const menuRepositorySpy = makeMenuRepository();
  const sut = new RegisterMenuUseCase({
    idGenerator: idGeneratorSpy,
    menuRepository: menuRepositorySpy,
  });
  return {
    sut,
    idGeneratorSpy,
    menuRepositorySpy,
  };
};

const makeIdGenerator = () => {
  const idGeneratorSpy = {
    execute() {
      return this.id;
    },
  };

  idGeneratorSpy.id = "any_menu_id";
  return idGeneratorSpy;
};

const makeIdGeneratorWithError = () => {
  return {
    execute() {
      throw new Error();
    },
  };
};

const makeMenuRepository = () => {
  class MenuRepositorySpy {
    async create({ id, businessId, name }) {
      this.id = id;
      this.businessId = businessId;
      this.name = name;
      return this.menu;
    }
  }

  const menuRepositorySpy = new MenuRepositorySpy();
  menuRepositorySpy.menu = {
    id: "any_menu_id",
    businessId: "any_business_id",
    name: "any_name",
  };
  return menuRepositorySpy;
};

const makeMenuRepositoryWithError = () => {
  class MenuRepositorySpy {
    create() {
      throw new Error();
    }
  }

  return new MenuRepositorySpy();
};

describe("Register Menu UseCase", () => {
  test("Should throw if no props are provided ", async () => {
    const { sut } = makeSut();
    await expect(sut.execute()).rejects.toThrow(new MissingParamError("name"));
  });

  test("Should throw if no name is provided ", async () => {
    const { sut } = makeSut();
    const props = {
      businessId: "any_business_id",
    };
    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("name"),
    );
  });

  test("Should throw if no businessId is provided ", async () => {
    const { sut } = makeSut();
    const props = {
      name: "any_name",
    };
    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("businessId"),
    );
  });

  test("Should call menuRepository with correct values", async () => {
    const { sut, menuRepositorySpy, idGeneratorSpy } = makeSut();
    const props = {
      name: "any_name",
      businessId: "any_business_id",
    };

    await sut.execute(props);
    expect(menuRepositorySpy.id).toBe(idGeneratorSpy.id);
    expect(menuRepositorySpy.businessId).toBe("any_business_id");
    expect(menuRepositorySpy.name).toBe("any_name");
  });

  test("Should return menu if everything is right", async () => {
    const { sut } = makeSut();
    const props = {
      name: "any_name",
      businessId: "any_business_id",
    };

    const menu = await sut.execute(props);
    expect(menu).toEqual({
      id: "any_menu_id",
      businessId: "any_business_id",
      name: "any_name",
    });
  });

  test("Should throw if invalid dependencieses are provided", async () => {
    const idGenerator = makeIdGenerator();
    const suts = [
      new RegisterMenuUseCase(),
      new RegisterMenuUseCase({}),
      new RegisterMenuUseCase({ idGenerator: {} }),
      new RegisterMenuUseCase({ idGenerator }),
      new RegisterMenuUseCase({ idGenerator, menuRepository: {} }),
    ];
    const props = {
      name: "any_name",
      businessId: "any_business_id",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if any dependency throws", async () => {
    const idGenerator = makeIdGenerator();
    const suts = [
      new RegisterMenuUseCase({
        idGenerator: makeIdGeneratorWithError(),
      }),
      new RegisterMenuUseCase({
        idGenerator,
        menuRepository: makeMenuRepositoryWithError(),
      }),
    ];
    const props = {
      name: "any_name",
      businessId: "any_business_id",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow();
    }
  });
});
