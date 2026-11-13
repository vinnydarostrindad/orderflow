import MissingParamError from "../../../utils/errors/missing-param-error.js";
import CloseTableSessionUseCase from "../../../domain/usecase/table_session/close-table-session-usecase.js";

const makeSut = () => {
  const tableSessionRepositorySpy = makeTableSessionRepository();
  const sut = new CloseTableSessionUseCase({
    tableSessionRepository: tableSessionRepositorySpy,
  });
  return {
    sut,
    tableSessionRepositorySpy,
  };
};

const makeTableSessionRepository = () => {
  class TableSessionRepositorySpy {
    async close(tableSessionId) {
      this.tableSessionId = tableSessionId;
      return this.tableSession;
    }
  }

  const tableSessionRepositorySpy = new TableSessionRepositorySpy();
  tableSessionRepositorySpy.tableSession = {
    id: "any_table_session_id",
    table_id: "any_table_id",
    name: "any_name",
    status: "closed",
  };

  return tableSessionRepositorySpy;
};

const makeTableSessionRepositoryWithError = () => {
  class TableSessionRepositorySpy {
    close() {
      throw new Error();
    }
  }

  return new TableSessionRepositorySpy();
};

describe("Close Table Session UseCase", () => {
  test("Should return closed table session if everything is right", async () => {
    const { sut } = makeSut();
    const props = {
      tableSessionId: "any_table_session_id",
    };

    const tableSession = await sut.execute(props);
    expect(tableSession).toEqual({
      id: "any_table_session_id",
      table_id: "any_table_id",
      name: "any_name",
      status: "closed",
    });
  });

  test("Should return null if session is not open", async () => {
    const { sut, tableSessionRepositorySpy } = makeSut();
    const props = {
      tableSessionId: "any_table_session_id",
    };

    tableSessionRepositorySpy.tableSession = null;

    const tableSession = await sut.execute(props);
    expect(tableSession).toBeNull();
  });

  test("Should throw if no props are provided", async () => {
    const { sut } = makeSut();
    await expect(sut.execute()).rejects.toThrow(
      new MissingParamError("tableSessionId"),
    );
  });

  test("Should throw if no tableSessionId is provided", async () => {
    const { sut } = makeSut();
    const props = {};

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("tableSessionId"),
    );
  });

  test("Should call tableSessionRepository with correct values", async () => {
    const { sut, tableSessionRepositorySpy } = makeSut();
    const props = {
      tableSessionId: "any_table_session_id",
    };

    await sut.execute(props);
    expect(tableSessionRepositorySpy.tableSessionId).toBe(
      "any_table_session_id",
    );
  });

  test("Should throw if invalid dependencies are provided", async () => {
    const suts = [
      new CloseTableSessionUseCase(),
      new CloseTableSessionUseCase({}),
      new CloseTableSessionUseCase({
        tableSessionRepository: {},
      }),
    ];
    const props = {
      tableSessionId: "any_table_session_id",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if any dependency throws", async () => {
    const suts = [
      new CloseTableSessionUseCase({
        tableSessionRepository: makeTableSessionRepositoryWithError(),
      }),
    ];
    const props = {
      tableSessionId: "any_table_session_id",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow();
    }
  });
});
