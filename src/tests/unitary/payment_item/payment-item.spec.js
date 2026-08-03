import PaymentItem from "../../../domain/entities/payment-item.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

describe("PaymentItem Entity", () => {
  test("Should throw if no props are provided", () => {
    expect(() => new PaymentItem()).toThrow(new MissingParamError("id"));
  });

  test("Should throw if no id is provided", () => {
    const props = {
      paymentId: "any_payment_id",
      orderItemId: "any_order_item_id",
      quantity: 1,
      amount: 20,
    };

    expect(() => new PaymentItem(props)).toThrow(new MissingParamError("id"));
  });

  test("Should throw if no paymentId is provided", () => {
    const props = {
      id: "any_payment_item_id",
      orderItemId: "any_order_item_id",
      quantity: 1,
      amount: 20,
    };

    expect(() => new PaymentItem(props)).toThrow(
      new MissingParamError("paymentId"),
    );
  });

  test("Should throw if no orderItemId is provided", () => {
    const props = {
      id: "any_payment_item_id",
      paymentId: "any_payment_id",
      quantity: 1,
      amount: 20,
    };

    expect(() => new PaymentItem(props)).toThrow(
      new MissingParamError("orderItemId"),
    );
  });

  test("Should throw if no quantity is provided", () => {
    const props = {
      id: "any_payment_item_id",
      paymentId: "any_payment_id",
      orderItemId: "any_order_item_id",
      amount: 20,
    };

    expect(() => new PaymentItem(props)).toThrow(
      new MissingParamError("quantity"),
    );
  });

  test("Should throw if no amount is provided", () => {
    const props = {
      id: "any_payment_item_id",
      paymentId: "any_payment_id",
      orderItemId: "any_order_item_id",
      quantity: 1,
    };

    expect(() => new PaymentItem(props)).toThrow(
      new MissingParamError("amount"),
    );
  });

  test("Should return PaymentItem", () => {
    const props = {
      id: "any_payment_item_id",
      paymentId: "any_payment_id",
      orderItemId: "any_order_item_id",
      quantity: 1,
      amount: 20,
    };

    const paymentItem = new PaymentItem(props);

    expect(paymentItem).toEqual({
      id: "any_payment_item_id",
      paymentId: "any_payment_id",
      orderItemId: "any_order_item_id",
      quantity: 1,
      amount: 20,
    });
  });
});
