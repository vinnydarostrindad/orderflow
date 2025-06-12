import RegisterTableUseCase from "../../../domain/usecase/table/register-table-usecase.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";
import DependencyError from "../../../utils/errors/dependency-error.js";
import RepositoryError from "../../../utils/errors/repository-error.js";

const makeSut = () => {
  const idGeneratorSpy = makeIdGenerator();
  const tableRepositorySpy = makeTableRepository();
  const sut = new RegisterTableUseCase({
    idGenerator: idGeneratorSpy,
    tableRepository: tableRepositorySpy,
  });
  return {
    sut,
    idGeneratorSpy,
    tableRepositorySpy,
  };
};

const makeIdGenerator = () => {
  const idGeneratorSpy = {
    execute() {
      return this.id;
    },
  };
  idGeneratorSpy.id = "any_table_id";
  return idGeneratorSpy;
};

const makeIdGeneratorWithError = () => {
  return {
    execute() {
      throw new Error();
    },
  };
};

const makeTableRepository = () => {
  class TableRepositorySpy {
    async create({ id, businessId, number, name }) {
      this.id = id;
      this.businessId = businessId;
      this.number = number;
      this.name = name;
      return this.table;
    }
  }

  const tableRepositorySpy = new TableRepositorySpy();
  tableRepositorySpy.table = {
    id: "any_table_id",
    businessId: "any_business_id",
    number: "any_number",
    name: "any_name",
  };
  return tableRepositorySpy;
};

const makeTableRepositoryWithError = () => {
  class TableRepositorySpy {
    create() {
      throw new Error();
    }
  }

  return new TableRepositorySpy();
};

describe("Register Table UseCase", () => {
  test("Should throw if no props are provided", async () => {
    const { sut } = makeSut();
    // Fazer uma validação melhor
    await expect(sut.execute()).rejects.toThrow(
      new MissingParamError("number"),
    );
  });

  test("Should throw if no name is provided", async () => {
    const { sut } = makeSut();
    const props = {
      businessId: "any_business_id",
      name: "any_name",
    };
    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("number"),
    );
  });

  test("Should throw if no businessId is provided", async () => {
    const { sut } = makeSut();
    const props = {
      number: "any_number",
      name: "any_name",
    };
    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("businessId"),
    );
  });

  test("Should throw if idGenerator returns invalid id", async () => {
    const { sut, idGeneratorSpy } = makeSut();
    const props = {
      businessId: "any_business_id",
      number: "any_number",
      name: "any_name",
    };
    idGeneratorSpy.id = null;

    await expect(sut.execute(props)).rejects.toThrow(
      new DependencyError("idGenerator"),
    );
  });

  test("Should call tableRepository with correct values", async () => {
    const { sut, tableRepositorySpy, idGeneratorSpy } = makeSut();
    const props = {
      businessId: "any_business_id",
      number: "any_number",
      name: "any_name",
    };

    await sut.execute(props);
    expect(tableRepositorySpy.id).toBe(idGeneratorSpy.id);
    expect(tableRepositorySpy.businessId).toBe("any_business_id");
    expect(tableRepositorySpy.name).toBe("any_name");
  });

  test("Should throw if tableRepository returns invalid table", async () => {
    const { sut, tableRepositorySpy } = makeSut();
    const props = {
      businessId: "any_business_id",
      number: "any_number",
      name: "any_name",
    };
    tableRepositorySpy.table = null;

    await expect(sut.execute(props)).rejects.toThrow(
      new RepositoryError("table"),
    );
  });

  test("Should return table if everything is right", async () => {
    const { sut } = makeSut();
    const props = {
      businessId: "any_business_id",
      number: "any_number",
      name: "any_name",
    };

    const table = await sut.execute(props);
    expect(table).toEqual({
      id: "any_table_id",
      businessId: "any_business_id",
      number: "any_number",
      name: "any_name",
    });
  });

  test("Should throw if invalid dependencies are provided", async () => {
    const idGenerator = makeIdGenerator();
    const suts = [
      new RegisterTableUseCase(),
      new RegisterTableUseCase({}),
      new RegisterTableUseCase({
        idGenerator: {},
      }),
      new RegisterTableUseCase({
        idGenerator,
      }),
      new RegisterTableUseCase({
        idGenerator,
        tableRepository: {},
      }),
    ];
    const props = {
      businessId: "any_business_id",
      number: "any_number",
      name: "any_name",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if any dependency throws", async () => {
    const idGenerator = makeIdGenerator();
    const suts = [
      new RegisterTableUseCase({
        idGenerator: makeIdGeneratorWithError(),
      }),
      new RegisterTableUseCase({
        idGenerator,
        tableRepository: makeTableRepositoryWithError(),
      }),
    ];
    const props = {
      businessId: "any_business_id",
      number: "any_number",
      name: "any_name",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow();
    }
  });
});
