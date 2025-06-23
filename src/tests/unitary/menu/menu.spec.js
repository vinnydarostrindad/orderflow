import Menu from "../../../domain/entities/menu.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

describe("Menu Entity", () => {
  test("Should throw if no props is provided", () => {
    expect(() => new Menu()).toThrow(new MissingParamError("id"));
  });

  test("Should throw if no id is provided", () => {
    const props = {
      businessId: "any_business_id",
      name: "any_name",
    };
    expect(() => new Menu(props)).toThrow(new MissingParamError("id"));
  });

  test("Should throw if no buisiness_id is provided", () => {
    const props = {
      id: "any_id",
      name: "any_name",
    };
    expect(() => new Menu(props)).toThrow(new MissingParamError("businessId"));
  });

  test("Should throw if no name is provided", () => {
    const props = {
      id: "any_id",
      businessId: "any_business_id",
    };
    expect(() => new Menu(props)).toThrow(new MissingParamError("name"));
  });

  test("Should return Menu", () => {
    const props = {
      id: "any_id",
      businessId: "any_business_id",
      name: "any_name",
    };

    const menu = new Menu(props);
    expect(menu).toEqual({
      id: "any_id",
      businessId: "any_business_id",
      name: "any_name",
    });
  });
});
