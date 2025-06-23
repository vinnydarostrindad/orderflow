import OrderItem from "../../../domain/entities/order-item.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

describe("OrderItem Entity", () => {
  test("Should throw if no props are provided", () => {
    expect(() => new OrderItem()).toThrow(new MissingParamError("id"));
  });

  test("Should throw if no id is provided", () => {
    const props = {
      orderId: "any_order_id",
      menuItemId: "any_menu_item_id",
      quantity: 2,
      unitPrice: 20,
      totalPrice: 40,
      notes: "any_notes",
    };
    expect(() => new OrderItem(props)).toThrow(new MissingParamError("id"));
  });

  test("Should throw if no menuItemId is provided", () => {
    const props = {
      id: "any_order_item_id",
      orderId: "any_order_id",
      quantity: 2,
      unitPrice: 20,
      totalPrice: 40,
      notes: "any_notes",
    };
    expect(() => new OrderItem(props)).toThrow(
      new MissingParamError("menuItemId"),
    );
  });

  test("Should throw if no orderId is provided", () => {
    const props = {
      id: "any_order_item_id",
      menuItemId: "any_menu_item_id",
      quantity: 2,
      unitPrice: 20,
      totalPrice: 40,
      notes: "any_notes",
    };
    expect(() => new OrderItem(props)).toThrow(
      new MissingParamError("orderId"),
    );
  });

  test("Should throw if no quantity is provided", () => {
    const props = {
      id: "any_order_item_id",
      orderId: "any_order_id",
      menuItemId: "any_menu_item_id",
      unitPrice: 20,
      totalPrice: 40,
      notes: "any_notes",
    };
    expect(() => new OrderItem(props)).toThrow(
      new MissingParamError("quantity"),
    );
  });

  test("Should throw if no unitPrice is provided", () => {
    const props = {
      id: "any_order_item_id",
      orderId: "any_order_id",
      menuItemId: "any_menu_item_id",
      quantity: 2,
      totalPrice: 40,
      notes: "any_notes",
    };
    expect(() => new OrderItem(props)).toThrow(
      new MissingParamError("unitPrice"),
    );
  });

  test("Should throw if no totalPrice is provided", () => {
    const props = {
      id: "any_order_item_id",
      orderId: "any_order_id",
      menuItemId: "any_menu_item_id",
      quantity: 2,
      unitPrice: 20,
      notes: "any_notes",
    };
    expect(() => new OrderItem(props)).toThrow(
      new MissingParamError("totalPrice"),
    );
  });

  test("Should return OrderItem", () => {
    const props = {
      id: "any_order_item_id",
      orderId: "any_order_id",
      menuItemId: "any_menu_item_id",
      quantity: 2,
      unitPrice: 20,
      totalPrice: 40,
      notes: "any_notes",
    };

    const item = new OrderItem(props);
    expect(item).toEqual({
      id: "any_order_item_id",
      orderId: "any_order_id",
      menuItemId: "any_menu_item_id",
      quantity: 2,
      unitPrice: 20,
      totalPrice: 40,
      notes: "any_notes",
    });
  });
});
