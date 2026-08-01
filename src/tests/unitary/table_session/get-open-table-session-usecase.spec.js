import MissingParamError from "../../../utils/errors/missing-param-error.js";
import GetOpenTableSessionUseCase from "../../../domain/usecase/table_session/get-open-table-session-usecase.js";

const makeSut = () => {
  const tableSessionRepositorySpy = makeTableSessionRepository();
  const sut = new GetOpenTableSessionUseCase({
    tableSessionRepository: tableSessionRepositorySpy,
  });
  return {
    sut,
    tableSessionRepositorySpy,
  };
};

const makeTableSessionRepository = () => {
  class TableSessionRepositorySpy {
    async findOpenByTableId(tableId) {
      this.tableId = tableId;
      return this.tableSession;
    }

    async findAllOpen(businessId) {
      this.businessId = businessId;
      return this.tableSessions;
    }
  }

  const tableSessionRepositorySpy = new TableSessionRepositorySpy();
  tableSessionRepositorySpy.tableSession = {
    id: "any_table_session_id",
    table_id: "any_table_id",
    name: "any_name",
    status: "open",
  };
  tableSessionRepositorySpy.tableSessions = [
    tableSessionRepositorySpy.tableSession,
  ];

  return tableSessionRepositorySpy;
};

const makeTableSessionRepositoryWithError = () => {
  class TableSessionRepositorySpy {
    findOpenByTableId() {
      throw new Error();
    }
  }

  return new TableSessionRepositorySpy();
};

describe("Get Open Table Session UseCase", () => {
  test("Should return table session if everything is right", async () => {
    const { sut } = makeSut();
    const props = {
      tableId: "any_table_id",
    };

    const tableSession = await sut.execute(props);
    expect(tableSession).toEqual({
      id: "any_table_session_id",
      table_id: "any_table_id",
      name: "any_name",
      status: "open",
    });
  });

  test("Should return null if no open session is found", async () => {
    const { sut, tableSessionRepositorySpy } = makeSut();
    const props = {
      tableId: "any_table_id",
    };

    tableSessionRepositorySpy.tableSession = null;

    const tableSession = await sut.execute(props);
    expect(tableSession).toBeNull();
  });

  test("Should throw if no props are provided", async () => {
    const { sut } = makeSut();
    await expect(sut.execute()).rejects.toThrow(
      new MissingParamError("businessId"),
    );
  });

  test("Should throw if no tableId is provided", async () => {
    const { sut } = makeSut();
    const props = {};

    await expect(sut.execute(props)).rejects.toThrow(
      new MissingParamError("businessId"),
    );
  });

  test("Should return open sessions if businessId is provided and tableId is not", async () => {
    const { sut, tableSessionRepositorySpy } = makeSut();

    const tableSessions = await sut.execute({ businessId: "any_business_id" });

    expect(tableSessions).toEqual([
      {
        id: "any_table_session_id",
        table_id: "any_table_id",
        name: "any_name",
        status: "open",
      },
    ]);
    expect(tableSessionRepositorySpy.businessId).toBe("any_business_id");
  });

  test("Should call tableSessionRepository with correct values", async () => {
    const { sut, tableSessionRepositorySpy } = makeSut();
    const props = {
      tableId: "any_table_id",
    };

    await sut.execute(props);
    expect(tableSessionRepositorySpy.tableId).toBe("any_table_id");
  });

  test("Should throw if invalid dependencies are provided", async () => {
    const suts = [
      new GetOpenTableSessionUseCase(),
      new GetOpenTableSessionUseCase({}),
      new GetOpenTableSessionUseCase({
        tableSessionRepository: {},
      }),
    ];
    const props = {
      tableId: "any_table_id",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow(TypeError);
    }
  });

  test("Should throw if any dependency throws", async () => {
    const suts = [
      new GetOpenTableSessionUseCase({
        tableSessionRepository: makeTableSessionRepositoryWithError(),
      }),
    ];
    const props = {
      tableId: "any_table_id",
    };

    for (const sut of suts) {
      await expect(sut.execute(props)).rejects.toThrow();
    }
  });
});
