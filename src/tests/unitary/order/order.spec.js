import Order from "../../../domain/entities/order.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

describe("Order Entity", () => {
  test("Should throw if no props are provided", () => {
    // Fazer uma validação melhor
    expect(() => new Order()).toThrow(new MissingParamError("id"));
  });

  test("Should throw if no id are provided", () => {
    const props = {
      businessId: "any_business_id",
      tableId: "any_table_id",
      tableNumber: "any_table_number",
    };
    expect(() => new Order(props)).toThrow(new MissingParamError("id"));
  });

  test("Should throw if no businessId is provided", () => {
    const props = {
      id: "any_order_id",
      tableId: "any_table_id",
      tableNumber: "any_table_number",
    };
    expect(() => new Order(props)).toThrow(new MissingParamError("businessId"));
  });

  test("Should throw if no tableId is provided", () => {
    const props = {
      id: "any_order_id",
      businessId: "any_business_id",
      tableNumber: "any_table_number",
    };
    expect(() => new Order(props)).toThrow(new MissingParamError("tableId"));
  });

  test("Should throw if no tableNumber is provided", () => {
    const props = {
      id: "any_order_id",
      businessId: "any_business_id",
      tableId: "any_table_id",
    };
    expect(() => new Order(props)).toThrow(
      new MissingParamError("tableNumber"),
    );
  });

  test("Should return Order", () => {
    const props = {
      id: "any_order_id",
      businessId: "any_business_id",
      tableId: "any_table_id",
      tableNumber: "any_table_number",
    };

    const menu = new Order(props);
    expect(menu).toEqual({
      id: "any_order_id",
      businessId: "any_business_id",
      tableId: "any_table_id",
      tableNumber: "any_table_number",
    });
  });
});
