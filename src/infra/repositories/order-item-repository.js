import MissingParamError from "../../utils/errors/missing-param-error.js";

export default class OrderItemRepository {
  constructor({ postgresAdapter } = {}) {
    this.postgresAdapter = postgresAdapter;
  }

  async create({
    id,
    orderId,
    menuItemId,
    quantity,
    unitPrice,
    totalPrice,
    notes,
  } = {}) {
    if (!id) throw new MissingParamError("id");
    if (!orderId) throw new MissingParamError("orderId");
    if (!menuItemId) throw new MissingParamError("menuItemId");
    if (!quantity) throw new MissingParamError("quantity");
    if (!unitPrice) throw new MissingParamError("unitPrice");
    if (!totalPrice) throw new MissingParamError("totalPrice");

    const result = await this.postgresAdapter.query({
      text: `
        INSERT INTO
          order_items (id, order_id, menu_item_id, quantity, unit_price, total_price, notes)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
          *
      ;`,
      values: [id, orderId, menuItemId, quantity, unitPrice, totalPrice, notes],
    });

    return result.rows[0];
  }

  async findAll(orderId) {
    if (!orderId) throw new MissingParamError("orderId");

    const result = await this.postgresAdapter.query({
      text: `
        SELECT 
          *
        FROM
          order_items
        WHERE
          order_id = $1
        LIMIT
          10
      ;`,
      values: [orderId],
    });

    return result.rows;
  }

  async findById(orderId, orderItemId) {
    if (!orderId) throw new MissingParamError("orderId");
    if (!orderItemId) throw new MissingParamError("orderItemId");

    const result = await this.postgresAdapter.query({
      text: `
        SELECT
          *
        FROM
          order_items
        WHERE
          id = $1 AND order_id = $2
        LIMIT
          1
        ;`,
      values: [orderItemId, orderId],
    });

    return result.rows[0];
  }
}
