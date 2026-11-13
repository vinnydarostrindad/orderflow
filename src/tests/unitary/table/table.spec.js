import Table from "../../../domain/entities/table.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

describe("Table Entity", () => {
  test("Should throw if no props is provided", () => {
    expect(() => new Table()).toThrow(new MissingParamError("id"));
  });

  test("Should throw if no id is provided", () => {
    const props = {
      businessId: "any_business_id",
      number: "1",
    };
    expect(() => new Table(props)).toThrow(new MissingParamError("id"));
  });

  test("Should throw if no businessId is provided", () => {
    const props = {
      id: "any_id",
      number: "1",
    };
    expect(() => new Table(props)).toThrow(new MissingParamError("businessId"));
  });

  test("Should throw if no number is provided", () => {
    const props = {
      id: "any_id",
      businessId: "any_business_id",
    };
    expect(() => new Table(props)).toThrow(new MissingParamError("number"));
  });

  test("Should return Table", () => {
    const props = {
      id: "any_id",
      businessId: "any_business_id",
      number: "1",
    };

    const table = new Table(props);
    expect(table).toEqual({
      id: "any_id",
      businessId: "any_business_id",
      number: "1",
    });
  });
});
