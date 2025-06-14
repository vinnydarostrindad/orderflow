import Business from "../../../domain/entities/business.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

describe("Business Entity", () => {
  test("Should throw if no props ", () => {
    expect(() => new Business()).toThrow(new MissingParamError("id"));
  });

  test("Should throw if no id is provided", () => {
    const props = {
      name: "any_name",
      email: "any_email@mail.com",
      hashedPassword: "any_hash",
    };
    expect(() => new Business(props)).toThrow(new MissingParamError("id"));
  });

  test("Should throw if no name is provided", () => {
    const props = {
      id: "any_id",
      email: "any_email@mail.com",
      hashedPassword: "any_hash",
    };
    expect(() => new Business(props)).toThrow(new MissingParamError("name"));
  });

  test("Should throw if no email is provided", () => {
    const props = {
      id: "any_id",
      name: "any_name",
      hashedPassword: "any_hash",
    };
    expect(() => new Business(props)).toThrow(new MissingParamError("email"));
  });

  test("Should throw if no hashedPassword is provided", () => {
    const props = {
      id: "any_id",
      name: "any_name",
      email: "any_email@mail.com",
    };
    expect(() => new Business(props)).toThrow(
      new MissingParamError("hashedPassword"),
    );
  });

  test("Should return business", () => {
    const props = {
      id: "any_id",
      name: "any_name",
      email: "any_email@mail.com",
      hashedPassword: "any_hash",
    };
    const business = new Business(props);
    expect(business).toEqual({
      id: "any_id",
      name: "any_name",
      email: "any_email@mail.com",
      hashedPassword: "any_hash",
    });
  });
});
