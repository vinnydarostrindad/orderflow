import RegisterMenuUseCase from "../../../domain/usecase/menu/register-menu-usecase.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import DependencyError from "../../../utils/errors/dependency-error.js";
import RepositoryError from "../../../utils/errors/repository-error.js";

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

  idGeneratorSpy.id = "any_id";
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
    async create({ id, business_id, name }) {
      this.id = id;
      this.business_id = business_id;
      this.name = name;
      return this.menu;
    }
  }

  const menuRepositorySpy = new MenuRepositorySpy();
  menuRepositorySpy.menu = {
    id: "any_id",
    business_id: "any_business_id",
    name: "any_name",
  };
  return menuRepositorySpy;
};

const makeMenuRepositoryWithError = () => {
  class menuRepositorySpy {
    create() {
      throw new Error();
    }
  }

  return new menuRepositorySpy();
};

describe("Register Menu UseCase", () => {
  test("Should throw if no props are provided ", async () => {
    const { sut } = makeSut();
    await expect(sut.execute()).rejects.toThrow(new MissingParamError("name"));
  });

  test("Should throw if no name is provided ", async () => {
    const { sut } = makeSut();
    const props = {
      business_id: "any_business_id",
    };
    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("name"),
    );
  });

  test("Should throw if no business_id is provided ", async () => {
    const { sut } = makeSut();
    const props = {
      name: "any_name",
    };
    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("business_id"),
    );
  });

  test("Should throw if idGenerator returns invalid id", async () => {
    const { sut, idGeneratorSpy } = makeSut();
    const props = {
      name: "any_name",
      business_id: "any_business_id",
    };
    idGeneratorSpy.id = null;

    await expect(sut.execute(props)).rejects.toThrow(
      new DependencyError("idGenerator"),
    );
  });

  test("Should call menuRepository with correct values", async () => {
    const { sut, menuRepositorySpy, idGeneratorSpy } = makeSut();
    const props = {
      name: "any_name",
      business_id: "any_business_id",
    };

    await sut.execute(props);
    expect(menuRepositorySpy.id).toBe(idGeneratorSpy.id);
    expect(menuRepositorySpy.business_id).toBe("any_business_id");
    expect(menuRepositorySpy.name).toBe("any_name");
  });

  test("Should throw if menuRepository returns invalid menu", async () => {
    const { sut, menuRepositorySpy } = makeSut();
    const props = {
      name: "any_name",
      business_id: "any_business_id",
    };
    menuRepositorySpy.menu = null;

    await expect(sut.execute(props)).rejects.toThrow(
      new RepositoryError("menu"),
    );
  });

  test("Should return menu if everything is right", async () => {
    const { sut } = makeSut();
    const props = {
      name: "any_name",
      business_id: "any_business_id",
    };

    const menu = await sut.execute(props);
    expect(menu).toEqual({
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
    });
  });

  test("Should throw if invalid denpendencies are provided", async () => {
    const idGenerator = makeIdGenerator();
    const suts = [
      new RegisterMenuUseCase(),
      new RegisterMenuUseCase({}),
      new RegisterMenuUseCase({
        idGenerator: {},
      }),
      new RegisterMenuUseCase({
        idGenerator,
      }),
      new RegisterMenuUseCase({
        idGenerator,
        menuRepository: {},
      }),
    ];
    const props = {
      name: "any_name",
      business_id: "any_business_id",
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
      business_id: "any_business_id",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow();
    }
  });
});
