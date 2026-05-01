import MissingParamError from "../../../utils/errors/missing-param-error.js";
import RegisterTableSessionUseCase from "../../../domain/usecase/table_session/register-table-session-usecase.js";

const makeSut = () => {
  const idGeneratorSpy = makeIdGenerator();
  const tableSessionRepositorySpy = makeTableSessionRepository();
  const sut = new RegisterTableSessionUseCase({
    idGenerator: idGeneratorSpy,
    tableSessionRepository: tableSessionRepositorySpy,
  });
  return {
    sut,
    idGeneratorSpy,
    tableSessionRepositorySpy,
  };
};

const makeIdGenerator = () => {
  const idGeneratorSpy = {
    execute() {
      return this.id;
    },
  };

  idGeneratorSpy.id = "any_table_session_id";
  return idGeneratorSpy;
};

const makeIdGeneratorWithError = () => {
  return {
    execute() {
      throw new Error();
    },
  };
};

const makeTableSessionRepository = () => {
  class TableSessionRepositorySpy {
    async create({ id, tableId, name }) {
      this.id = id;
      this.tableId = tableId;
      this.name = name;
      return this.tableSession;
    }
  }

  const tableSessionRepositorySpy = new TableSessionRepositorySpy();
  tableSessionRepositorySpy.tableSession = {
    id: "any_table_session_id",
    table_id: "any_table_id",
    name: "any_name",
    status: "open",
  };

  return tableSessionRepositorySpy;
};

const makeTableSessionRepositoryWithError = () => {
  class TableSessionRepositorySpy {
    create() {
      throw new Error();
    }
  }

  return new TableSessionRepositorySpy();
};

describe("Register Table Session UseCase", () => {
  test("Should return table session if everything is right", async () => {
    const { sut } = makeSut();
    const props = {
      tableId: "any_table_id",
      name: "any_name",
    };

    const tableSession = await sut.execute(props);
    expect(tableSession).toEqual({
      id: "any_table_session_id",
      table_id: "any_table_id",
      name: "any_name",
      status: "open",
    });
  });

  test("Should throw if no props are provided", async () => {
    const { sut } = makeSut();
    await expect(sut.execute()).rejects.toThrow(
      new MissingParamError("tableId"),
    );
  });

  test("Should throw if no tableId is provided", async () => {
    const { sut } = makeSut();
    const props = {
      name: "any_name",
    };

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("tableId"),
    );
  });

  test("Should call tableSessionRepository with correct values", async () => {
    const { sut, tableSessionRepositorySpy, idGeneratorSpy } = makeSut();
    const props = {
      tableId: "any_table_id",
      name: "any_name",
    };

    await sut.execute(props);
    expect(tableSessionRepositorySpy.id).toBe(idGeneratorSpy.id);
    expect(tableSessionRepositorySpy.tableId).toBe("any_table_id");
    expect(tableSessionRepositorySpy.name).toBe("any_name");
  });

  test("Should throw if invalid dependencies are provided", async () => {
    const idGenerator = makeIdGenerator();
    const suts = [
      new RegisterTableSessionUseCase(),
      new RegisterTableSessionUseCase({}),
      new RegisterTableSessionUseCase({
        idGenerator: {},
      }),
      new RegisterTableSessionUseCase({
        idGenerator,
      }),
      new RegisterTableSessionUseCase({
        idGenerator,
        tableSessionRepository: {},
      }),
    ];
    const props = {
      tableId: "any_table_id",
      name: "any_name",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if any dependency throws", async () => {
    const idGenerator = makeIdGenerator();
    const suts = [
      new RegisterTableSessionUseCase({
        idGenerator: makeIdGeneratorWithError(),
      }),
      new RegisterTableSessionUseCase({
        idGenerator,
        tableSessionRepository: makeTableSessionRepositoryWithError(),
      }),
    ];
    const props = {
      tableId: "any_table_id",
      name: "any_name",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow();
    }
  });
});
