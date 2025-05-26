import sut from "../../infra/adaptors/postgres-adapter.js";
import MissingParamError from "../../utils/errors/missing-param-error.js";

describe("Postgres Adapter", () => {
  test("Should throw if no queryObject is provided", async () => {
    const promise = sut.query();
    expect(promise).rejects.toThrow(new MissingParamError("queryObject"));
  });
});
