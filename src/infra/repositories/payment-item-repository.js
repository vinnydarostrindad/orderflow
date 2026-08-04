import MissingParamError from "../../utils/errors/missing-param-error.js";

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
}
