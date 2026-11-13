import MissingParamError from "../../../utils/errors/missing-param-error.js";
import TableSessionRepository from "../../../infra/repositories/table-session-repository.js";

const makeSut = () => {
  const postgresAdapterSpy = makePostgresAdapter();
  const sut = new TableSessionRepository({
    postgresAdapter: postgresAdapterSpy,
  });
  return {
    sut,
    postgresAdapterSpy,
  };
};

const makePostgresAdapter = () => {
  const postgresAdapterSpy = {
    async query(query) {
      this.queryObject = query;
      return this.result;
    },
  };

  postgresAdapterSpy.result = {
    rows: [
      {
        id: "any_table_session_id",
        table_id: "any_table_id",
        name: "any_name",
        status: "open",
      },
    ],
  };

  return postgresAdapterSpy;
};

describe("Table Session Repository", () => {
  test("Should throw if no id is provided on create", async () => {
    const { sut } = makeSut();
    await expect(sut.create()).rejects.toThrow(new MissingParamError("id"));
  });

  test("Should throw if no tableId is provided on create", async () => {
    const { sut } = makeSut();
    await expect(sut.create({ id: "any_id" })).rejects.toThrow(
      new MissingParamError("tableId"),
    );
  });

  test("Should call postgresAdapter with correct query on create", async () => {
    const { sut, postgresAdapterSpy } = makeSut();
    const props = {
      id: "any_table_session_id",
      tableId: "any_table_id",
      name: "any_name",
    };

    await sut.create(props);
    expect(postgresAdapterSpy.queryObject.values).toEqual([
      "any_table_session_id",
      "any_table_id",
      "any_name",
    ]);
  });

  test("Should return created table session on create", async () => {
    const { sut } = makeSut();
    const props = {
      id: "any_table_session_id",
      tableId: "any_table_id",
      name: "any_name",
    };

    const tableSession = await sut.create(props);
    expect(tableSession).toEqual({
      id: "any_table_session_id",
      table_id: "any_table_id",
      name: "any_name",
      status: "open",
    });
  });

  test("Should throw if no tableId is provided on findOpenByTableId", async () => {
    const { sut } = makeSut();
    await expect(sut.findOpenByTableId()).rejects.toThrow(
      new MissingParamError("tableId"),
    );
  });

  test("Should call postgresAdapter with correct query on findOpenByTableId", async () => {
    const { sut, postgresAdapterSpy } = makeSut();

    await sut.findOpenByTableId("any_table_id");
    expect(postgresAdapterSpy.queryObject.values).toEqual(["any_table_id"]);
  });

  test("Should return open table session on findOpenByTableId", async () => {
    const { sut } = makeSut();

    const tableSession = await sut.findOpenByTableId("any_table_id");
    expect(tableSession).toEqual({
      id: "any_table_session_id",
      table_id: "any_table_id",
      name: "any_name",
      status: "open",
    });
  });

  test("Should throw if no tableSessionId is provided on close", async () => {
    const { sut } = makeSut();
    await expect(sut.close()).rejects.toThrow(
      new MissingParamError("tableSessionId"),
    );
  });

  test("Should call postgresAdapter with correct query on close", async () => {
    const { sut, postgresAdapterSpy } = makeSut();

    await sut.close("any_table_session_id");
    expect(postgresAdapterSpy.queryObject.values).toEqual([
      "any_table_session_id",
    ]);
  });

  test("Should return closed table session on close", async () => {
    const { sut, postgresAdapterSpy } = makeSut();
    postgresAdapterSpy.result.rows = [
      {
        id: "any_table_session_id",
        table_id: "any_table_id",
        name: "any_name",
        status: "closed",
      },
    ];

    const tableSession = await sut.close("any_table_session_id");
    expect(tableSession).toEqual({
      id: "any_table_session_id",
      table_id: "any_table_id",
      name: "any_name",
      status: "closed",
    });
  });
});
