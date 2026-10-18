import MissingParamError from "../../utils/errors/missing-param-error.js";
import ValidationError from "../../utils/errors/validation-error.js";

export default class PaymentItemRepository {
  constructor({ postgresAdapter } = {}) {
    this.postgresAdapter = postgresAdapter;
  }

  async create({ id, paymentId, orderItemId, quantity, amount } = {}) {
    if (!id) throw new MissingParamError("id");
    if (!paymentId) throw new MissingParamError("paymentId");
    if (!orderItemId) throw new MissingParamError("orderItemId");
    if (!quantity) throw new MissingParamError("quantity");
    if (!amount) throw new MissingParamError("amount");

    await this.validateUniqueOrderItemId(paymentId, orderItemId);

    const result = await this.postgresAdapter.query({
      text: `
        INSERT INTO
          payment_items (id, payment_id, order_item_id, quantity, amount)
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING
          *
      ;`,
      values: [id, paymentId, orderItemId, quantity, amount],
    });

    return result.rows[0];
  }

  async findById(paymentId, paymentItemId) {
    if (!paymentId) throw new MissingParamError("paymentId");
    if (!paymentItemId) throw new MissingParamError("paymentItemId");

    const result = await this.postgresAdapter.query({
      text: `
        SELECT
          *
        FROM
          payment_items
        WHERE
          payment_id = $1 AND id = $2
        LIMIT
          1
      ;`,
      values: [paymentId, paymentItemId],
    });

    return result.rows[0];
  }

  async findAllByPaymentId(paymentId) {
    if (!paymentId) throw new MissingParamError("paymentId");

    const result = await this.postgresAdapter.query({
      text: `
        SELECT
          *
        FROM
          payment_items
        WHERE
          payment_id = $1
      ;`,
      values: [paymentId],
    });

    return result.rows;
  }

  async validateUniqueOrderItemId(paymentId, orderItemId) {
    if (!paymentId) throw new MissingParamError("paymentId");
    if (!orderItemId) throw new MissingParamError("orderItemId");

    const result = await this.postgresAdapter.query({
      text: `
        SELECT
          *
        FROM
          payment_items
        WHERE
          order_item_id = $1
      `,
      values: [orderItemId],
    });

    if (result.rows.length > 0) {
      throw new ValidationError({
        message: "Order item has already been paid",
        action: "No need to pay again",
      });
    }
  }
}
