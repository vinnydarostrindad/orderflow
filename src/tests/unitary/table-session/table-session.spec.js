import TableSession from "../../../domain/entities/table-session";
import MissingParamError from "../../../utils/errors/missing-param-error";

describe("Table Session", () => {
  test("Should throw if no props is provided", () => {
    expect(() => new TableSession()).toThrow(
      new MissingParamError("tableSessionId"),
    );
  });

  test("Should throw if no id is provided", () => {
    const props = {
      tableId: "any_table_id",
      name: "any_name",
    };
    expect(() => new TableSession(props)).toThrow(
      new MissingParamError("tableSessionId"),
    );
  });

  test("Should throw if no tableId is provided", () => {
    const props = {
      id: "any_id",
      name: "any_name",
    };
    expect(() => new TableSession(props)).toThrow(
      new MissingParamError("tableId"),
    );
  });

  test("Should return Table Session", () => {
    const props = {
      id: "any_id",
      tableId: "any_table_id",
      name: "any_name",
    };

    const tableSession = new TableSession(props);
    expect(tableSession).toEqual({
      id: "any_id",
      tableId: "any_table_id",
      name: "any_name",
    });
  });
});
