import Employee from "../../../domain/entities/employee.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

describe("Employee Entity", () => {
  test("Should throw if no props are provided", () => {
    // Fazer uma validação de erros melhor
    expect(() => new Employee()).toThrow(new MissingParamError("id"));
  });

  test("Should throw if no id are provided", () => {
    const props = {
      business_id: "any_business_id",
      name: "any_name",
      hashedPassword: "any_hash",
      role: "any_role",
    };
    expect(() => new Employee(props)).toThrow(new MissingParamError("id"));
  });

  test("Should throw if no buisness_id are provided", () => {
    const props = {
      id: "any_id",
      name: "any_name",
      hashedPassword: "any_hash",
      role: "any_role",
    };
    expect(() => new Employee(props)).toThrow(
      new MissingParamError("business_id"),
    );
  });

  test("Should throw if no name are provided", () => {
    const props = {
      id: "any_id",
      business_id: "any_business_id",
      hashedPassword: "any_hash",
      role: "any_role",
    };
    expect(() => new Employee(props)).toThrow(new MissingParamError("name"));
  });

  test("Should throw if no hashedPassword are provided", () => {
    const props = {
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
      role: "any_role",
    };
    expect(() => new Employee(props)).toThrow(
      new MissingParamError("hashedPassword"),
    );
  });
  test("Should throw if no role are provided", () => {
    const props = {
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
      hashedPassword: "any_hash",
    };
    expect(() => new Employee(props)).toThrow(new MissingParamError("role"));
  });

  test("Should return employee", () => {
    const props = {
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
      hashedPassword: "any_hash",
      role: "any_role",
    };
    const employee = new Employee(props);
    expect(employee).toEqual({
      id: "any_id",
      business_id: "any_business_id",
      name: "any_name",
      hashedPassword: "any_hash",
      role: "any_role",
    });
  });
});
