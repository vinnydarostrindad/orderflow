import Payment from "../../../domain/entities/payment.js";
import MissingParamError from "../../../utils/errors/missing-param-error.js";

describe("Payment Entity", () => {
  test("Should throw if no props are provided", () => {
    expect(() => new Payment()).toThrow(new MissingParamError("id"));
  });

  test("Should throw if no id is provided", () => {
    const props = {
      tableSessionId: "any_table_session_id",
      method: "pix",
      amount: 100,
      status: "completed",
    };

    expect(() => new Payment(props)).toThrow(new MissingParamError("id"));
  });

  test("Should throw if no tableSessionId is provided", () => {
    const props = {
      id: "any_payment_id",
      method: "pix",
      amount: 100,
      status: "completed",
    };

    expect(() => new Payment(props)).toThrow(
      new MissingParamError("tableSessionId"),
    );
  });

  test("Should throw if no method is provided", () => {
    const props = {
      id: "any_payment_id",
      tableSessionId: "any_table_session_id",
      amount: 100,
      status: "completed",
    };

    expect(() => new Payment(props)).toThrow(new MissingParamError("method"));
  });

  test("Should throw if no amount is provided", () => {
    const props = {
      id: "any_payment_id",
      tableSessionId: "any_table_session_id",
      method: "pix",
      status: "completed",
    };

    expect(() => new Payment(props)).toThrow(new MissingParamError("amount"));
  });

  test("Should throw if no status is provided", () => {
    const props = {
      id: "any_payment_id",
      tableSessionId: "any_table_session_id",
      method: "pix",
      amount: 100,
    };

    expect(() => new Payment(props)).toThrow(new MissingParamError("status"));
  });

  test("Should return Payment", () => {
    const props = {
      id: "any_payment_id",
      tableSessionId: "any_table_session_id",
      method: "pix",
      amount: 100,
      status: "completed",
    };

    const payment = new Payment(props);

    expect(payment).toEqual({
      id: "any_payment_id",
      tableSessionId: "any_table_session_id",
      method: "pix",
      amount: 100,
      status: "completed",
    });
  });
});
